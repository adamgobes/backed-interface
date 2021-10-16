import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import { jsonRpcLoanFacilitator } from '../../lib/contracts';
import { formattedAnnualRate } from '../../lib/interest';
import { secondsToDays } from '../../lib/duration';
import { LoanInfo } from '../../lib/LoanInfoType';

interface TicketHistoryProps {
  loanInfo: LoanInfo;
}

export default function TicketHistory({ loanInfo } : TicketHistoryProps) {
  const [history, setHistory] = useState(null);

  const setup = async () => {
    const history = await getTicketHistory(loanInfo.loanId);
    console.log('0000');
    console.log(history);
    setHistory(history);
  };

  useEffect(() => {
    setup();
  }, []);

  return (
    <fieldset className="standard-fieldset">
      <legend> activity </legend>
      {history == null
        ? ''
        : history.map((e: ethers.Event, i) => (
            <ParsedEvent
              event={e}
              loanInfo={loanInfo}
              key={i}
            />
          ))}
    </fieldset>
  );
}

interface ParsedEventProps {
  event: ethers.Event;
  loanInfo: LoanInfo;
}

function ParsedEvent({ event, loanInfo }: ParsedEventProps) {
  const [timestamp, setTimestamp] = useState(0);

  const getTimeStamp = async () => {
    const t = await event.getBlock();
    setTimestamp(t.timestamp);
  };

  useEffect(() => {
    getTimeStamp();
  });
  const eventDetails = () => {
    switch (event.event) {
      case 'MintTicket':
        return MintEventDetails(event, loanInfo);
        break;
      case 'UnderwriteLoan':
        return UnderwriteEventDetails(event, loanInfo);
        break;
      case 'Repay':
        return RepayEventDetails(event, loanInfo);
        break;
    }
  };

  return (
    <div className="event-details">
      <p>
        {' '}
        <b> {camelToSentenceCase(event.event)} </b> -{' '}
        {toLocaleDateTime(timestamp)}{' '}
      </p>
      {eventDetails()}
    </div>
  );
}

function MintEventDetails(
  event: ethers.Event,
  loanInfo: LoanInfo
) {
  const [minter] = useState(event.args.minter);
  const [maxInterestRate] = useState(
    formattedAnnualRate(event.args.maxInterestRate),
  );
  const [minLoanAmount] = useState(
    ethers.utils.formatUnits(event.args.minLoanAmount, loanInfo.loanAssetDecimals),
  );
  const [minDuration] = useState(secondsToDays(event.args.minDurationSeconds));

  return (
    <div className="event-details">
      <p>
        {' '}
        minter:
        <a
          target="_blank"
          href={`${process.env.NEXT_PUBLIC_ETHERSCAN_URL}/address/${minter}`}
          rel="noreferrer">
          {' '}
          {minter.slice(0, 10)}
          ...{' '}
        </a>
      </p>
      <p>
        {' '}
        max interest rate:
        {maxInterestRate}%
      </p>
      <p>
        {`minimum loan amount: ${minLoanAmount} ${loanInfo.loanAssetSymbol}`}
      </p>
      <p>
        {`minimum duration: ${minDuration} days`}
      </p>
    </div>
  );
}

function toLocaleDateTime(seconds) {
  const date = new Date(0);
  date.setUTCSeconds(seconds);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

function camelToSentenceCase(text) {
  const result = text.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function UnderwriteEventDetails(
  event: ethers.Event,
  loanInfo: LoanInfo,
) {
  const [underwriter] = useState(event.args.underwriter);
  const [interestRate] = useState(formattedAnnualRate(event.args.interestRate));
  const [loanAmount] = useState(
    ethers.utils.formatUnits(event.args.loanAmount, loanInfo.loanAssetDecimals),
  );
  const [duration] = useState(secondsToDays(event.args.durationSeconds));

  return (
    <div className="event-details">
      <p>
        {' '}
        lender:
        <a
          target="_blank"
          href={`${process.env.NEXT_PUBLIC_ETHERSCAN_URL}/address/${underwriter}`}
          rel="noreferrer">
          {' '}
          {underwriter.slice(0, 10)}
          ...{' '}
        </a>
      </p>
      <p>
        {' '}
        interest rate:
        {interestRate}%
      </p>
      <p>
        {`loan amount: ${loanAmount} ${loanInfo.loanAssetSymbol}`}
      </p>
      <p>
        {`duration: ${duration} days`}
      </p>
    </div>
  );
}

function RepayEventDetails(
  event: ethers.Event,
  loanInfo: LoanInfo
) {
  const [repayer] = useState(event.args.repayer);
  const [interestEarned] = useState(
    ethers.utils.formatUnits(event.args.interestEarned, loanInfo.loanAssetDecimals),
  );
  const [loanAmount] = useState(
    ethers.utils.formatUnits(event.args.loanAmount, loanInfo.loanAssetDecimals),
  );
  const [loanOwner] = useState(event.args.loanOwner);

  return (
    <div className="event-details">
      <p>
        {' '}
        repayer:
        <a
          target="_blank"
          href={`${process.env.NEXT_PUBLIC_ETHERSCAN_URL}/address/${repayer}`}
          rel="noreferrer">
          {' '}
          {repayer.slice(0, 10)}
          ...{' '}
        </a>
      </p>
      <p>
        {' '}
        paid to:
        <a
          target="_blank"
          href={`${process.env.NEXT_PUBLIC_ETHERSCAN_URL}/address/${loanOwner}`}
          rel="noreferrer">
          {' '}
          {loanOwner.slice(0, 10)}
          ...{' '}
        </a>
      </p>
      <p>
        {' '}
        interest earned:
        {interestEarned}
      </p>
      <p>
        {' '}
        loan amount:
        {loanAmount}
      </p>
    </div>
  );
}

interface EventTextProps {
  event: ethers.Event;
}

function EventText({ event }: EventTextProps) {
  const [argValues, setArgValues] = useState([]);

  useEffect(() => {
    let argValues = Object.keys(event.args).map((k: string) => {
      if (`${parseInt(k)}` == k || k == 'id') {
        return null;
      }
      let value = event.args[k];
      if (value instanceof ethers.BigNumber) {
        value = value.toString();
      }
      value = `${value}`;
      if (value.length > 10) {
        value = `${value.slice(0, 10)}...`;
      }

      return { arg: k, value };
    });
    argValues = argValues.filter((a) => a != null);

    console.log(argValues);
    setArgValues(argValues);
  }, []);

  return (
    <div className="display-table">
      <p>
        <b>{event.event}</b> - block #{event.blockNumber}
      </p>
      {argValues.map((k, i) => (
        <ArgValueProps arg={k.arg} value={k.value} key={i} />
      ))}
      <br />
    </div>
  );
}

interface ArgValueProps {
  arg: string;
  value: any;
}

function ArgValueProps({ arg, value }: ArgValueProps) {
  return (
    <div className="display-table">
      <p className="float-left">
        {arg}: {value}
      </p>
    </div>
  );
}

const getTicketHistory = async (loanId) => {
  const contract = jsonRpcLoanFacilitator()

  const mintTicketFilter = contract.filters.CreateLoan(
    loanId,
    null,
  );
  const closeFilter = contract.filters.Close(loanId);
  const underwriteFilter = contract.filters.UnderwriteLoan(
    loanId
  );
  const buyoutUnderwriteFilter = contract.filters.BuyoutUnderwriter(
    loanId
  );
  const repayAndCloseFilter = contract.filters.Repay(
    loanId
  );
  const seizeCollateralFilter = contract.filters.SeizeCollateral(
    loanId,
  );

  const filters = [
    mintTicketFilter,
    closeFilter,
    underwriteFilter,
    buyoutUnderwriteFilter,
    repayAndCloseFilter,
    seizeCollateralFilter,
  ];

  let allEvents = [];
  for (let i = 0; i < filters.length; i++) {
    const results = await contract.queryFilter(filters[i]);
    allEvents = allEvents.concat(results);
  }
  allEvents.sort((a, b) => b.blockNumber - a.blockNumber);

  return allEvents;
};
