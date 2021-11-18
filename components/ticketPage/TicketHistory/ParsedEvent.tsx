import {
  EtherscanAddressLink,
  EtherscanTransactionLink,
} from 'components/EtherscanLink';
import { ethers } from 'ethers';
import { secondsToDays } from 'lib/duration';
import { formattedAnnualRate } from 'lib/interest';
import { LoanInfo } from 'lib/LoanInfoType';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import styles from './TicketHistory.module.css';

const eventDetailComponents: { [key: string]: (...props: any) => JSX.Element } =
  {
    CreateLoan: CreateLoanEvent,
    UnderwriteLoan: UnderwriteLoanEvent,
    BuyoutUnderwriter: BuyoutUnderwriterEvent,
    Repay: RepayLoanEvent,
  };

type ParsedEventProps = {
  event: ethers.Event;
  loanInfo: LoanInfo;
};
export function ParsedEvent({ event, loanInfo }: ParsedEventProps) {
  const component =
    // keeping typescript happy and having some measure of runtime safety
    eventDetailComponents[event.event || '__INTERNAL_DID_NOT_RECEIVE_EVENT'];
  if (component) {
    return React.createElement(component, { event, loanInfo });
  }
  console.warn(new Error(`received unhandled event type: ${event.event}`));
  return null;
}

function toLocaleDateTime(seconds: number) {
  var date = new Date(0);
  date.setUTCSeconds(seconds);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

function camelToSentenceCase(text: string) {
  const result = text.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function EventHeader({ event }: Pick<ParsedEventProps, 'event'>) {
  const [timestamp, setTimestamp] = useState<string | null>(null);

  const getTimestamp = useCallback(async () => {
    const { timestamp } = await event.getBlock();
    setTimestamp(toLocaleDateTime(timestamp));
  }, [event]);

  useEffect(() => {
    getTimestamp();
  }, [getTimestamp]);
  return (
    <h3 className={styles['event-header']}>
      <EtherscanTransactionLink transactionHash={event.transactionHash}>
        <b>{camelToSentenceCase(event.event as string)}</b> {timestamp}
      </EtherscanTransactionLink>
    </h3>
  );
}

const EventDetailList: FunctionComponent<Pick<ParsedEventProps, 'event'>> = ({
  children,
  event,
  ...props
}) => {
  return (
    <li>
      <section className={styles.section}>
        <EventHeader event={event} />
        <ul {...props} className={styles.list}>
          {children}
        </ul>
      </section>
    </li>
  );
};

function CreateLoanEvent({
  event,
  loanInfo: { loanAssetDecimals, loanAssetSymbol },
}: ParsedEventProps) {
  const { maxInterestRate, minDurationSeconds, minLoanAmount, minter } =
    event.args as any;

  const minterLink = useMemo(
    () => (
      <EtherscanAddressLink address={minter} title={minter}>
        {minter?.slice(0, 10)}...
      </EtherscanAddressLink>
    ),
    [minter],
  );

  const formattedMaxInterestRate = useMemo(
    () => formattedAnnualRate(maxInterestRate),
    [maxInterestRate],
  );

  const formattedMinLoanAmount = useMemo(
    () => ethers.utils.formatUnits(minLoanAmount, loanAssetDecimals),
    [minLoanAmount, loanAssetDecimals],
  );

  const minDuration = useMemo(
    () => secondsToDays(minDurationSeconds),
    [minDurationSeconds],
  );

  return (
    <EventDetailList event={event}>
      <li>minter: {minterLink}</li>
      <li>max interest rate: {formattedMaxInterestRate}%</li>
      <li>
        minimum loan amount: {formattedMinLoanAmount} {loanAssetSymbol}
      </li>
      <li>minimum duration: {minDuration} days</li>
    </EventDetailList>
  );
}

function UnderwriteLoanEvent({
  event,
  loanInfo: { loanAssetDecimals, loanAssetSymbol },
}: ParsedEventProps) {
  const { durationSeconds, interestRate, loanAmount, underwriter } =
    event.args as any;

  const underwriterLink = useMemo(
    () => (
      <EtherscanAddressLink address={underwriter} title={underwriter}>
        {underwriter?.slice(0, 10)}...
      </EtherscanAddressLink>
    ),
    [underwriter],
  );

  const formattedInterestRate = useMemo(
    () => formattedAnnualRate(interestRate),
    [interestRate],
  );
  const formattedLoanAmount = useMemo(
    () => ethers.utils.formatUnits(loanAmount, loanAssetDecimals),
    [loanAmount, loanAssetDecimals],
  );
  const formattedDuration = useMemo(
    () => secondsToDays(durationSeconds),
    [durationSeconds],
  );

  return (
    <EventDetailList event={event}>
      <li>lender: {underwriterLink}</li>
      <li>interest rate: {formattedInterestRate}%</li>
      <li>
        loan amount: {formattedLoanAmount} {loanAssetSymbol}
      </li>
      <li>duration: {formattedDuration} days</li>
    </EventDetailList>
  );
}

function BuyoutUnderwriterEvent({
  event,
  loanInfo: { loanAssetDecimals, loanAssetSymbol },
}: ParsedEventProps) {
  const { interestEarned, replacedAmount, replacedLoanOwner, underwriter } =
    event.args as any;

  const newLenderLink = useMemo(
    () => (
      <EtherscanAddressLink address={underwriter} title={underwriter}>
        {underwriter.slice(0, 10)}...
      </EtherscanAddressLink>
    ),
    [underwriter],
  );

  const replacedLenderLink = useMemo(
    () => (
      <EtherscanAddressLink
        address={replacedLoanOwner}
        title={replacedLoanOwner}>
        {replacedLoanOwner.slice(0, 10)}...
      </EtherscanAddressLink>
    ),
    [replacedLoanOwner],
  );

  const formattedInterestPaid = useMemo(
    () => ethers.utils.formatUnits(interestEarned, loanAssetDecimals),
    [interestEarned, loanAssetDecimals],
  );

  const formattedLoanAmount = useMemo(
    () => ethers.utils.formatUnits(replacedAmount, loanAssetDecimals),
    [replacedAmount, loanAssetDecimals],
  );

  return (
    <EventDetailList event={event}>
      <li>new lender: {newLenderLink}</li>
      <li>bought-out lender: {replacedLenderLink}</li>
      <li>
        interest paid: {formattedInterestPaid} {loanAssetSymbol}
      </li>
      <li>
        loan amount: {formattedLoanAmount} {loanAssetSymbol}
      </li>
    </EventDetailList>
  );
}

function RepayLoanEvent({
  event,
  loanInfo: { loanAssetDecimals, loanAssetSymbol },
}: ParsedEventProps) {
  const { interestEarned, loanAmount, loanOwner, repayer } = event.args as any;

  const repayerLink = useMemo(
    () => (
      <EtherscanAddressLink address={repayer} title={repayer}>
        {repayer.slice(0, 10)}...
      </EtherscanAddressLink>
    ),
    [repayer],
  );

  const loanOwnerLink = useMemo(
    () => (
      <EtherscanAddressLink address={loanOwner} title={loanOwner}>
        {loanOwner.slice(0, 10)}...
      </EtherscanAddressLink>
    ),
    [loanOwner],
  );

  const formattedInterestEarned = useMemo(
    () => ethers.utils.formatUnits(interestEarned, loanAssetDecimals),
    [interestEarned, loanAssetDecimals],
  );

  const formattedLoanAmount = useMemo(
    () => ethers.utils.formatUnits(loanAmount, loanAssetDecimals),
    [loanAmount, loanAssetDecimals],
  );

  return (
    <EventDetailList event={event}>
      <li>repayer: {repayerLink}</li>
      <li>paid to: {loanOwnerLink}</li>
      <li>
        interest earned: {formattedInterestEarned} {loanAssetSymbol}
      </li>
      <li>
        loan amount: {formattedLoanAmount} {loanAssetSymbol}
      </li>
    </EventDetailList>
  );
}