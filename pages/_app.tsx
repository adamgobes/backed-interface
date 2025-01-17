import 'styles/global.css';
import 'styles/fonts-maru.css';
import 'normalize.css';
import '@rainbow-me/rainbowkit/styles.css';
import {
  RainbowKitProvider,
  Chain,
  getDefaultWallets,
  connectorsForWallets,
  lightTheme,
} from '@rainbow-me/rainbowkit';
import { AppProps } from 'next/app';
import { AppWrapper } from 'components/layouts/AppWrapper';
import { providers } from 'ethers';
import { TimestampProvider } from 'hooks/useTimestamp/useTimestamp';
import { GlobalMessagingProvider } from 'hooks/useGlobalMessages';
import { WagmiProvider, chain } from 'wagmi';
import { CachedRatesProvider } from 'hooks/useCachedRates/useCachedRates';
import { HasCollapsedHeaderInfoProvider } from 'hooks/useHasCollapsedHeaderInfo';
import { Footer } from 'components/Footer';

const jsonRpcProvider = new providers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER,
);

const chains: Chain[] = [{ ...chain.rinkeby, name: 'Rinkeby' }];

const wallets = getDefaultWallets({
  chains,
  appName: 'Backed',
  jsonRpcUrl: ({ chainId }) =>
    chains.find((x) => x.id === chainId)?.rpcUrls?.[0] ??
    chain.mainnet.rpcUrls[0],
});

wallets[0].wallets.sort((a, b) => a.id.localeCompare(b.id));

const connectors = connectorsForWallets(wallets)({
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '1'),
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <GlobalMessagingProvider>
      <RainbowKitProvider theme={lightTheme()} chains={chains}>
        <WagmiProvider
          autoConnect
          connectors={connectors}
          provider={jsonRpcProvider}>
          <TimestampProvider>
            <CachedRatesProvider>
              <HasCollapsedHeaderInfoProvider>
                <AppWrapper>
                  <Component {...pageProps} />
                  <Footer />
                </AppWrapper>
              </HasCollapsedHeaderInfoProvider>
            </CachedRatesProvider>
          </TimestampProvider>
        </WagmiProvider>
      </RainbowKitProvider>
    </GlobalMessagingProvider>
  );
}
