import { ethers } from 'ethers';
import Link from 'next/link';
import React, { useMemo } from 'react';
import styles from './LoanCard.module.css';
import { TokenURIAndID, useTokenMetadata } from 'hooks/useTokenMetadata';
import { Media } from 'components/Media';
import { GetNFTInfoResponse } from 'lib/getNFTInfo';
import { Fallback } from 'components/Media/Fallback';
import { Loan } from 'types/Loan';
import { DescriptionList } from 'components/DescriptionList';
import { useLoanDetails } from 'hooks/useLoanDetails';

type LoanCardProps = {
  loan: Loan;
  selectedAddress?: string;
  display?: 'expanded' | 'compact';
};

export function LoanCard({
  loan,
  selectedAddress,
  display = 'expanded',
}: LoanCardProps) {
  const title = `View loan #${loan.id}`;

  const tokenSpec: TokenURIAndID = useMemo(
    () => ({
      tokenURI: loan.collateralTokenURI,
      tokenID: ethers.BigNumber.from(loan.collateralTokenId),
      forceImage: true,
    }),
    [loan.collateralTokenId, loan.collateralTokenURI],
  );

  const maybeMetadata = useTokenMetadata(tokenSpec);

  const relationship =
    selectedAddress === loan.borrower ? 'borrower' : 'lender';
  const attributes = useMemo(
    () =>
      display === 'expanded' ? (
        <ExpandedAttributes loan={loan} />
      ) : (
        <CompactAttributes loan={loan} />
      ),
    [display, loan],
  );

  if (maybeMetadata.isLoading) {
    return (
      <LoanCardLoading id={loan.id.toString()}>
        {selectedAddress && <Relationship>{relationship}</Relationship>}
        {attributes}
      </LoanCardLoading>
    );
  } else {
    return (
      <LoanCardLoaded
        id={loan.id.toString()}
        title={title}
        metadata={maybeMetadata.metadata}>
        {selectedAddress && <Relationship>{relationship}</Relationship>}
        {attributes}
      </LoanCardLoaded>
    );
  }
}

type LoanCardLoadedProps = {
  id: string;
  title: string;
  metadata: GetNFTInfoResponse | null;
};

/**
 * Only exported for the Storybook. Please use top-level LoanCard.
 */
export function LoanCardLoaded({
  id,
  title,
  metadata,
  children,
}: React.PropsWithChildren<LoanCardLoadedProps>) {
  return (
    <Link href={`/loans/${id}`}>
      <a className={styles['profile-link']} aria-label={title} title={title}>
        <div className={styles['profile-card']}>
          <div className={styles.media}>
            {metadata && (
              <Media
                media={metadata.mediaUrl}
                mediaMimeType={metadata.mediaMimeType}
                autoPlay={false}
              />
            )}
            {!metadata && <Fallback animated={false} />}
          </div>

          <div className={styles['profile-card-attributes']}>
            <span>{metadata ? metadata.name : '--'}</span>
            {children}
          </div>
        </div>
      </a>
    </Link>
  );
}

type LoanCardLoadingProps = { id: string };

/**
 * Only exported for the Storybook. Please use top-level LoanCard.
 */
export function LoanCardLoading({
  children,
  id,
}: React.PropsWithChildren<LoanCardLoadingProps>) {
  return (
    <Link href={`/loans/${id}`}>
      <a className={styles['profile-link']}>
        <div className={styles['profile-card']}>
          <Fallback />
          <div className={styles['profile-card-attributes']}>
            <span>loading name</span>
            {children}
          </div>
        </div>
      </a>
    </Link>
  );
}

type AttributesProps = {
  loan: Loan;
};
export const ExpandedAttributes = ({ loan }: AttributesProps) => {
  const {
    formattedPrincipal,
    formattedInterestRate,
    formattedInterestAccrued,
    formattedStatus,
    formattedTotalDuration,
    formattedTimeRemaining,
  } = useLoanDetails(loan);
  return (
    <DescriptionList>
      <dt>Amount</dt>
      <dd>{formattedPrincipal}</dd>
      <div className={styles['stacked-entry']}>
        <dt>interest</dt>
        <dd>{formattedInterestRate}</dd>
      </div>
      <div className={styles['stacked-entry']}>
        <dt>accrued</dt>
        <dd>{formattedInterestAccrued}</dd>
      </div>
      <div className={styles['stacked-entry']}>
        <dt>duration</dt>
        <dd>{formattedTotalDuration}</dd>
      </div>
      <div className={styles['stacked-entry']}>
        <dt>{statusLabel(formattedStatus)}</dt>
        <dd>{formattedTimeRemaining}</dd>
      </div>
    </DescriptionList>
  );
};

export const CompactAttributes = ({ loan }: AttributesProps) => {
  const {
    formattedPrincipal,
    formattedInterestRate,
    formattedStatus,
    formattedTimeRemaining,
    formattedTotalDuration,
  } = useLoanDetails(loan);
  return (
    <DescriptionList>
      <div className={styles['stacked-entry']}>
        <dt>Amount</dt>
        <dd>{formattedPrincipal}</dd>
      </div>
      <div className={styles['stacked-entry']}>
        <dt>interest</dt>
        <dd>{formattedInterestRate}</dd>
      </div>
      <div className={styles['stacked-entry']}>
        <dt>duration</dt>
        <dd>{formattedTotalDuration}</dd>
      </div>
      <div className={styles['stacked-entry']}>
        <dt>{statusLabel(formattedStatus)}</dt>
        <dd>{formattedTimeRemaining}</dd>
      </div>
    </DescriptionList>
  );
};

export const Relationship: React.FunctionComponent = ({ children }) => {
  return <span className={styles.relationship}>{children}</span>;
};

function statusLabel(status: string) {
  if (status === 'Accruing interest') {
    return 'time left';
  }
  return 'status';
}
