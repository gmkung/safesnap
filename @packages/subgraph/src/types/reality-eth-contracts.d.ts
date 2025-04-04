declare module '@reality.eth/contracts' {
  export interface ChainData {
    chainId: string;
    chainName: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    network_name: string;
    rpcUrls: string[];
    hostedRPC: string;
    graphURL?: string;
    blockExplorerUrls: string[];
    deprecated?: boolean;
    atprotoBot?: string;
  }

  export function chainData(chainId: number): ChainData | null;
} 