import { ethers } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { GetNFTInfoResponse, getNFTInfo } from 'lib/getNFTInfo';
import { Media } from 'components/Media';
import { jsonRpcERC721Contract } from 'lib/contracts';

interface NFTMediaProps {
  collateralAddress: string;
  collateralTokenID: ethers.BigNumber;
  forceImage?: boolean;
}

export function NFTMedia({
  collateralAddress,
  collateralTokenID,
  forceImage = false,
}: NFTMediaProps) {
  const [nftInfo, setNFTInfo] = useState<GetNFTInfoResponse | null>(null);

  const load = useCallback(async () => {
    const contract = jsonRpcERC721Contract(collateralAddress);

    const result = await getNFTInfo({
      contract,
      tokenId: collateralTokenID,
      forceImage,
    });
    setNFTInfo(result);
  }, [collateralAddress, collateralTokenID, forceImage]);

  useEffect(() => {
    load();
  }, [load]);

  if (!nftInfo) {
    return null;
  }

  return (
    <Media
      media={nftInfo.mediaUrl}
      mediaMimeType={nftInfo.mediaMimeType}
      autoPlay={false}
    />
  );
}