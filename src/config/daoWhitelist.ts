
// Official whitelist of DAOs with their logos
export interface WhitelistedDAO {
  ens: string;
  logo: string;
  description?: string;
}

export const whitelistedDAOs: WhitelistedDAO[] = [
  {
    ens: "dsla.eth",
    logo: "https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F8ac9df86-ad1f-4a14-be56-50a65ca0362f%2FdFzvOBQh_400x400.jpg?id=6758677e-c8b4-4561-b807-50370122e722&table=block&spaceId=e3f5e49c-bb2b-4b05-a28a-a7efa913c5ea&width=60&freeze=true&userId=30fed56e-803b-44e9-8697-e685a0c43ccd&cache=v2",
    description: ""
  },
{
    ens: "PantherProtocol.eth",
    logo: "/lovable-uploads/f02ee888-5e1c-42bb-a45a-b1cedb8068ac.png",
    description: ""
  },
  {
    ens: "bycerulean.eth",
    logo: "/lovable-uploads/f02ee888-5e1c-42bb-a45a-b1cedb8068ac.png",
    description: ""
  },
  {
    ens: "fraktalgov.eth",
    logo: "/lovable-uploads/f02ee888-5e1c-42bb-a45a-b1cedb8068ac.png",
    description: ""
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
