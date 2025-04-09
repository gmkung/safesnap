
// Official whitelist of DAOs with their logos
export interface WhitelistedDAO {
  ens: string;
  logo: string;
  description?: string;
}

export const whitelistedDAOs: WhitelistedDAO[] = [
  {
    ens: "kleros.eth",
    logo: "/lovable-uploads/f02ee888-5e1c-42bb-a45a-b1cedb8068ac.png",
    description: "Decentralized dispute resolution protocol"
  },
  {
    ens: "gitcoin.eth",
    logo: "https://avatars.githubusercontent.com/u/30044474",
    description: "Public goods funding platform"
  },
  {
    ens: "aragon.eth",
    logo: "https://assets-global.website-files.com/63f0a0f9ca989e09f0aa3b3b/63f5cb87eed04f8b6f5da1e5_aragon-logo.svg",
    description: "DAO governance platform"
  },
  {
    ens: "ens.eth",
    logo: "https://app.ens.domains/static/favicon.ico",
    description: "Ethereum Name Service"
  },
  {
    ens: "uniswap.eth",
    logo: "https://app.uniswap.org/images/512x512_App_Icon.png",
    description: "Decentralized exchange protocol"
  },
  {
    ens: "1inch.eth",
    logo: "https://1inch.io/img/logo.png",
    description: "DEX aggregator protocol"
  },
  {
    ens: "zufunding.eth",
    logo: "https://avatars.githubusercontent.com/u/54278783",
    description: "DeFi funding platform"
  }
];
