import { captureException } from '@sentry/nextjs';
import { ethers } from 'ethers';
import { NFTResponseData } from 'pages/api/nftInfo/[uri]';

export interface GetNFTInfoResponse {
  name: string;
  description: string;
  mediaUrl: string;
  mediaMimeType: string;
  id: ethers.BigNumber;
}

export async function getNFTInfoFromTokenInfo(
  tokenId: ethers.BigNumber,
  tokenURI: string,
  forceImage: boolean = false,
): Promise<GetNFTInfoResponse | null> {
  const isDataUri = tokenURI.startsWith('data:');
  try {
    const tokenURIRes = await fetch(
      isDataUri ? tokenURI : `/api/nftInfo/${encodeURIComponent(tokenURI)}`,
    );
    const NFTInfo: NFTResponseData = await tokenURIRes.json();

    if (!NFTInfo) {
      return null;
    }

    const { mediaUrl, mediaMimeType } = await supportedMedia(
      NFTInfo,
      forceImage,
    );

    return {
      id: tokenId,
      name: NFTInfo?.name,
      description: NFTInfo?.description,
      mediaUrl,
      mediaMimeType,
    };
  } catch (error) {
    captureException(error);
    return null;
  }
}

async function getMimeType(mediaUrl: string) {
  const defaultMimeType = 'application/octet-stream';
  try {
    const res = await fetch(mediaUrl, { method: 'HEAD' });
    // If we get no mime type in headers, we don't know what the MIME type is
    return res.headers.get('Content-Type') || defaultMimeType;
  } catch (e) {
    // Likely what happened here is a failure to fetch due to CORS. Could
    // sidestep by proxying this through an API route.
    captureException(e);
    return defaultMimeType;
  }
}

async function supportedMedia(
  nft: NFTResponseData,
  forceImage?: boolean,
): Promise<{ mediaUrl: string; mediaMimeType: string }> {
  const { animation_url, image } = nft!;

  const [animationMimeType, imageMimeType] = await Promise.all([
    getMimeType(animation_url || ''),
    getMimeType(image || ''),
  ]);

  if (forceImage || !animation_url || animationMimeType.includes('text')) {
    return { mediaUrl: image, mediaMimeType: imageMimeType };
  }

  return { mediaUrl: animation_url, mediaMimeType: animationMimeType };
}
