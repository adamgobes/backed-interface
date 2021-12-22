import { DescriptionList } from 'components/DescriptionList';
import { TwoColumn } from 'components/layouts/TwoColumn';
import { Media } from 'components/Media';
import { Fallback } from 'components/Media/Fallback';
import { useLoanDetails } from 'hooks/useLoanDetails';
import { Loan } from 'lib/types/Loan';
import React, { useMemo } from 'react';
import styles from './LoanHeader.module.css';

type CollateralMedia = {
  mediaUrl: string;
  mediaMimeType: string;
};

type LoanHeaderProps = {
  loan: Loan;
  collateralMedia: CollateralMedia | null;
};

const listComponentLookup: {
  [key: string]: (props: ListProps) => JSX.Element;
} = {
  Closed: LoanHeaderClosedList,
  'Awaiting lender': LoanHeaderAwaitingList,
  'Loading...': LoanHeaderLoadingList,
  'Past due': LoanHeaderPastDueList,
  'Accruing interest': LoanHeaderAccruingList,
};

export function LoanHeader({ collateralMedia, loan }: LoanHeaderProps) {
  const details = useLoanDetails(loan);
  const List = useMemo(
    () => listComponentLookup[details.formattedStatus],
    [details.formattedStatus],
  );
  return (
    <div className={styles['loan-header']}>
      <TwoColumn>
        {collateralMedia && (
          <Media
            media={collateralMedia.mediaUrl}
            mediaMimeType={collateralMedia.mediaMimeType}
            autoPlay
          />
        )}
        {!collateralMedia && <Fallback />}
        <div>
          <List details={details} />
        </div>
      </TwoColumn>
    </div>
  );
}

type ListProps = {
  details: ReturnType<typeof useLoanDetails>;
};

function LoanHeaderLoadingList({
  details: {
    formattedStatus,
    formattedTotalDuration,
    formattedInterestRate,
    formattedLoanID,
    formattedPrincipal,
  },
}: ListProps) {
  return (
    <DescriptionList orientation="horizontal">
      <dt>{formattedLoanID}</dt>
      <dd>{formattedPrincipal}</dd>
      <dt>Interest Rate</dt>
      <dd>{formattedInterestRate}</dd>
      <dt>Duration</dt>
      <dd>{formattedTotalDuration}</dd>
      <dt>Status</dt>
      <dd>{formattedStatus}</dd>
    </DescriptionList>
  );
}

function LoanHeaderAwaitingList({
  details: {
    formattedStatus,
    formattedInterestRate,
    formattedLoanID,
    formattedPrincipal,
  },
}: ListProps) {
  return (
    <DescriptionList orientation="horizontal">
      <dt>{formattedLoanID}</dt>
      <dd>{formattedPrincipal}</dd>
      <dt>Interest Rate</dt>
      <dd>{formattedInterestRate}</dd>
      <dt>Status</dt>
      <dd>{formattedStatus}</dd>
    </DescriptionList>
  );
}

function LoanHeaderClosedList({
  details: {
    formattedStatus,
    formattedTotalDuration,
    formattedInterestRate,
    formattedLoanID,
    formattedPrincipal,
    formattedInterestAccrued,
    formattedTotalPayback,
  },
}: ListProps) {
  return (
    <DescriptionList orientation="horizontal">
      <dt>{formattedLoanID}</dt>
      <dd>{formattedPrincipal}</dd>
      <dt>Interest Rate</dt>
      <dd>{formattedInterestRate}</dd>
      <dt>Status</dt>
      <dd className={styles.red}>{formattedStatus}</dd>
      <dt>Accrued</dt>
      <dd>{formattedInterestAccrued}</dd>
      <dt>Duration</dt>
      <dd>{formattedTotalDuration}</dd>
      <dt>Remaining</dt>
      <dd>0 days</dd>
      <dt>Total Payback</dt>
      <dd>{formattedTotalPayback}</dd>
    </DescriptionList>
  );
}

function LoanHeaderAccruingList({
  details: {
    formattedStatus,
    formattedTotalDuration,
    formattedInterestRate,
    formattedLoanID,
    formattedPrincipal,
    formattedInterestAccrued,
    formattedEstimatedPaybackAtMaturity,
  },
}: ListProps) {
  return (
    <DescriptionList orientation="horizontal">
      <dt>{formattedLoanID}</dt>
      <dd>{formattedPrincipal}</dd>
      <dt>Interest Rate</dt>
      <dd>{formattedInterestRate}</dd>
      <dt>Status</dt>
      <dd>{formattedStatus}</dd>
      <dt>Accrued</dt>
      <dd>{formattedInterestAccrued}</dd>
      <dt>Duration</dt>
      <dd>{formattedTotalDuration}</dd>
      <dt>Remaining</dt>
      <dd>some amount of time</dd>
      <dt>Est. Payback</dt>
      <dd>{formattedEstimatedPaybackAtMaturity}</dd>
    </DescriptionList>
  );
}

function LoanHeaderPastDueList({
  details: {
    formattedStatus,
    formattedTotalDuration,
    formattedInterestRate,
    formattedLoanID,
    formattedPrincipal,
    formattedInterestAccrued,
    formattedEstimatedPaybackAtMaturity,
  },
}: ListProps) {
  return (
    <DescriptionList orientation="horizontal">
      <dt>{formattedLoanID}</dt>
      <dd>{formattedPrincipal}</dd>
      <dt>Interest Rate</dt>
      <dd>{formattedInterestRate}</dd>
      <dt>Status</dt>
      <dd className={styles.red}>{formattedStatus}</dd>
      <dt>Accrued</dt>
      <dd>{formattedInterestAccrued}</dd>
      <dt>Duration</dt>
      <dd>{formattedTotalDuration}</dd>
      <dt>Remaining</dt>
      <dd>0 days</dd>
      <dt>Est. Payback</dt>
      <dd>{formattedEstimatedPaybackAtMaturity}</dd>
    </DescriptionList>
  );
}