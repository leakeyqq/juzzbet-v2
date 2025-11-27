'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { getWeb3AuthConnector } from '../lib/web3AuthConnector'; // adjust path if needed


import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { celo, celoAlfajores } from 'wagmi/chains';
import { farcasterFrame } from '@farcaster/frame-wagmi-connector'
// import Layout from '../components/Layout';
import { injectedWallet, walletConnectWallet, valoraWallet } from '@rainbow-me/rainbowkit/wallets';

const queryClient = new QueryClient();

      const connectors = connectorsForWallets(
      [
        {
          groupName: 'Recommended',
          wallets: [injectedWallet, walletConnectWallet, valoraWallet],
        },
      ],
      {
        appName: 'Questpanda',
        projectId: process.env.WC_PROJECT_ID ?? '044601f65212332475a09bc14ceb3c34',
      }
    );

    // Add Web3Auth manually after RainbowKit connectors
    const allConnectors = [
      ...connectors,
      getWeb3AuthConnector([celo, celoAlfajores]),
      farcasterFrame()
    ];

    const config = createConfig({
      connectors: allConnectors,
      chains: [celo, celoAlfajores],
      transports: {
        [celo.id]: http(),
        [celoAlfajores.id]: http()
      },
    });

// const queryClient = new QueryClient();

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider coolMode>
          {/* <Layout>{children}</Layout> */}
          {children}

        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
