import {
  AllowButton,
  CompletedButton,
  TransactionButton,
} from 'components/Button';
import { ethers } from 'ethers';
import { ErrorMessage, Field, Formik } from 'formik';
import { useLoanUnderwriter } from 'hooks/useLoanUnderwriter';
import { secondsBigNumToDays } from 'lib/duration';
import { formattedAnnualRate } from 'lib/interest';
import { Loan } from 'lib/types/Loan';
import React, { useMemo } from 'react';
import * as Yup from 'yup';
import styles from './LoanForm.module.css';

type LoanFormAwaitingProps = {
  loan: Loan;
  balance: number;
  needsAllowance: boolean;
  setNeedsAllowance: (value: boolean) => void;
  refresh: () => void;
};
export function LoanFormAwaiting({
  loan,
  balance,
  needsAllowance,
  setNeedsAllowance,
  refresh,
}: LoanFormAwaitingProps) {
  const initialAmount = useMemo(
    () =>
      parseFloat(
        ethers.utils.formatUnits(loan.loanAmount, loan.loanAssetDecimals),
      ),
    [loan.loanAmount, loan.loanAssetDecimals],
  );
  const initialInterestRate = useMemo(
    () => parseFloat(formattedAnnualRate(loan.perSecondInterestRate)),
    [loan.perSecondInterestRate],
  );
  const initialDuration = useMemo(
    () => secondsBigNumToDays(loan.durationSeconds),
    [loan.durationSeconds],
  );

  const { underwrite, transactionPending, txHash } = useLoanUnderwriter(
    loan,
    refresh,
  );

  return (
    <Formik
      initialValues={{
        amount: initialAmount,
        interestRate: initialInterestRate,
        duration: initialDuration,
      }}
      validationSchema={Yup.object({
        amount: Yup.number().min(initialAmount).max(balance),
        interestRate: Yup.number().max(initialInterestRate),
        duration: Yup.number().min(initialDuration),
      })}
      onSubmit={underwrite}>
      {(formik) => (
        <form className={styles.form} onSubmit={formik.handleSubmit}>
          <CompletedButton buttonText="Lend against this NFT" />

          <label htmlFor="amount">
            <span>Amount ({loan.loanAssetSymbol})</span>
            <Field name="amount" />
          </label>
          <ErrorMessage name="amount" />

          <label htmlFor="interestRate">
            <span>Interest Rate</span>
            <Field name="interestRate" />
          </label>
          <ErrorMessage name="interestRate" />

          <label htmlFor="duration">
            <span>Duration (Days)</span>
            <Field name="duration" />
          </label>
          <ErrorMessage name="duration" />
          <AllowButton
            contractAddress={loan.loanAssetContractAddress}
            symbol={loan.loanAssetSymbol}
            callback={() => setNeedsAllowance(false)}
            done={!needsAllowance}
          />
          <TransactionButton
            text="Lend"
            type="submit"
            txHash={txHash}
            isPending={transactionPending}
            disabled={needsAllowance}
          />
        </form>
      )}
    </Formik>
  );
}