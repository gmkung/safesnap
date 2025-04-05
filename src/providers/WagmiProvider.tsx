
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, goerli, sepolia } from 'wagmi/chains';
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors';
import { ReactNode } from 'react';

// Create a custom wagmi client config
export const config = createConfig({
  chains: [mainnet, goerli, sepolia],
  connectors: [
    injected(),
    metaMask(),
    safe(),
    walletConnect({
      projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "default-project-id",
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [goerli.id]: http(),
    [sepolia.id]: http(),
  },
});

// Create a client for tanstack/react-query
const queryClient = new QueryClient();

interface WagmiProviderWrapperProps {
  children: ReactNode;
}

export function WagmiProviderWrapper({ children }: WagmiProviderWrapperProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
