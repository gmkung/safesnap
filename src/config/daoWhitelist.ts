
// Official whitelist of DAOs with their logos
export interface WhitelistedDAO {
  ens: string;
  logo: string;
  description?: string;
}

export const whitelistedDAOs: WhitelistedDAO[] = [
  {
    ens: "dsla.eth",
    logo: "https://s2.coinmarketcap.com/static/img/coins/200x200/5423.png",
    description: ""
  },
{
    ens: "PantherProtocol.eth",
    logo: "https://s3.coinmarketcap.com/static-gravity/image/029fe663f26a425bb8fa6bde913f8882.png",
    description: ""
  },
  {
    ens: "bycerulean.eth",
    logo: "/lovable-uploads/f02ee888-5e1c-42bb-a45a-b1cedb8068ac.png",
    description: ""
  },
  {
    ens: "fraktalgov.eth",
    logo: "https://avatars.githubusercontent.com/u/35736288?v=4",
    description: ""
  },
  {
    ens: "1inch.eth",
    logo: "https://1inch.io/assets/token-logo/1inch_token.png",
    description: "DEX aggregator protocol"
  },
  {
    ens: "zufunding.eth",
    logo: "https://s1.coincarp.com/logo/1/zufinance.png?style=200",
    description: "DeFi funding platform"
  }
];
