
export interface Token {
    symbol: string;
    name: string;
    logo: string;
  }
  
  export interface Network {
    id: string;
    name: string;
    logo: string;
  }
  
  export const networks: Network[] = [
    {
      id: "ethereum",
      name: "Ethereum",
      logo: "/placeholder.svg",
    },
    {
      id: "polygon",
      name: "Polygon",
      logo: "/placeholder.svg",
    },
    {
      id: "arbitrum",
      name: "Arbitrum",
      logo: "/placeholder.svg",
    },
  ];
  
  export const tokens: { [networkId: string]: Token[] } = {
    ethereum: [
      {
        symbol: "ETH",
        name: "Ethereum",
        logo: "/placeholder.svg",
      },
      {
        symbol: "USDC",
        name: "USD Coin",
        logo: "/placeholder.svg",
      },
      {
        symbol: "USDT",
        name: "Tether",
        logo: "/placeholder.svg",
      },
    ],
    polygon: [
      {
        symbol: "MATIC",
        name: "Polygon",
        logo: "/placeholder.svg",
      },
      {
        symbol: "USDC",
        name: "USD Coin (Polygon)",
        logo: "/placeholder.svg",
      },
    ],
    arbitrum: [
      {
        symbol: "ARB",
        name: "Arbitrum",
        logo: "/placeholder.svg",
      },
      {
        symbol: "USDC",
        name: "USD Coin (Arbitrum)",
        logo: "/placeholder.svg",
      },
    ],
  };