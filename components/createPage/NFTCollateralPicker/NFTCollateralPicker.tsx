import { ethers } from 'ethers';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Fieldset } from 'components/Fieldset';
import styles from './NFTCollateralPicker.module.css';
import { getNFTInfoFromTokenInfo, GetNFTInfoResponse } from 'lib/getNFTInfo';
import { Media } from 'components/Media';

const colors = ['#5CB88C', '#D7C9F9', '#222426'];
const HIDDEN_COLLECTIONS = ['0x015220c326587eb5ff9613aafaa343b5b751aaf1'];

export interface NFTFromSubgraph {
  id: string;
  identifier: string;
  uri: string;
  registry: {
    symbol: string;
    name: string;
  };
}

interface NFTCollateralPickerProps {
  nfts: [NFTFromSubgraph];
}

interface GroupedNFTCollections {
  [key: string]: [NFTFromSubgraph];
}

export function NFTCollateralPicker({ nfts }: NFTCollateralPickerProps) {
  const [showNFT, setShowNFT] = useState({});

  const groupedNFTs: GroupedNFTCollections = useMemo(() => {
    return nfts.reduce((groupedNFTs, nextNFT) => {
      const collection: string = nextNFT.registry.name;
      const nftContractAddress: string = nextNFT.id.substring(0, 42);

      if (HIDDEN_COLLECTIONS.includes(nftContractAddress)) return groupedNFTs; // skip if hidden collection
      if (!!groupedNFTs[collection]) {
        groupedNFTs[collection] = [...groupedNFTs[collection], nextNFT];
      } else {
        groupedNFTs[collection] = [nextNFT];
      }
      return groupedNFTs;
    }, {});
  }, [nfts]);

  const toggleShowForNFT = useCallback(
    (groupName) => {
      setShowNFT((prev) => ({
        ...prev,
        [groupName]: !showNFT[groupName],
      }));
    },
    [showNFT, setShowNFT],
  );

  return (
    <div className={styles.nftPicker}>
      <div className={styles.selectButton}>select an NFT</div>
      {Object.keys(groupedNFTs).map((nftGroupName, i) => (
        <div key={nftGroupName}>
          <div className={styles.nftCollectionRow}>
            <div className={styles.nftCollectionNameAndIcon}>
              <div
                className={styles.collectionIcon}
                style={{ background: colors[i] }}
              />
              <div className={styles.collectionName}>
                {nftGroupName.toLowerCase()}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <span className={styles.number}>
                {groupedNFTs[nftGroupName].length}
              </span>
              <div
                className={`${styles.caret} ${
                  showNFT[nftGroupName] ? styles.caretOpen : ''
                }`}
                onClick={() => toggleShowForNFT(nftGroupName)}>
                <Caret />
              </div>
            </div>
          </div>
          {
            <div
              className={`${styles.nftGridWrapper} ${
                showNFT[nftGroupName] ? styles.gridOpen : styles.gridClosed
              } `}>
              {groupedNFTs[nftGroupName].map((nft) => (
                <div
                  key={nft.id}
                  className={`${styles.nftGridItem} ${
                    showNFT[nftGroupName]
                      ? styles.itemOpened
                      : styles.itemClosed
                  }`}>
                  <NFTMedia tokenId={nft.identifier} tokenUri={nft.uri} />
                </div>
              ))}
            </div>
          }
          <div className={styles.break} />
        </div>
      ))}
    </div>
  );
}

function NFTMedia({ tokenId, tokenUri }) {
  const [nftInfo, setNFTInfo] = useState<GetNFTInfoResponse>(null);

  const load = useCallback(async () => {
    const result = await getNFTInfoFromTokenInfo(tokenId, tokenUri, true);
    setNFTInfo(result);
  }, [tokenId, tokenUri]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      {nftInfo == null ? (
        ''
      ) : (
        <div>
          <Media
            media={nftInfo.mediaUrl}
            mediaMimeType={nftInfo.mediaMimeType}
            autoPlay={false}
          />
        </div>
      )}
    </div>
  );
}

function Caret() {
  return (
    <svg
      width="35"
      height="35"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.565 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"></path>
    </svg>
  );
}
