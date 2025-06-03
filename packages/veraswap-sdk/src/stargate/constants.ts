import { Address } from "viem";
import { arbitrum, arbitrumSepolia, bsc, mainnet, optimism, optimismSepolia, sepolia } from "viem/chains";

// From https://stargateprotocol.gitbook.io/stargate/v2-developer-docs/technical-reference/mainnet-contracts
export const CHAIN_ID_TO_ENDPOINT_ID = {
    [arbitrum.id]: 30110,
    [mainnet.id]: 30101,
    [optimism.id]: 30111,
    [arbitrumSepolia.id]: 40231,
    [optimismSepolia.id]: 40232,
    [sepolia.id]: 40161,
    [bsc.id]: 30102,
} as const satisfies Record<number, number>;

// NOTE: not supported and irrelevant for BNB, Polygon
// https://stargateprotocol.gitbook.io/stargate/v2-developer-docs/technical-reference/mainnet-contracts
export const STARGATE_POOL_NATIVE = {
    [arbitrum.id]: "0xA45B5130f36CDcA45667738e2a258AB09f4A5f7F",
    [mainnet.id]: "0x77b2043768d28E9C9aB44E1aBfC95944bcE57931",
    [optimism.id]: "0xe8CDF27AcD73a434D661C84887215F7598e7d0d3",
    [arbitrumSepolia.id]: "0x6fddB6270F6c71f31B62AE0260cfa8E2e2d186E0",
    [optimismSepolia.id]: "0xa31dCc5C71E25146b598bADA33E303627D7fC97e",
    [sepolia.id]: "0x9Cc7e185162Aa5D1425ee924D97a87A0a34A0706",
} as const satisfies { [K in keyof typeof CHAIN_ID_TO_ENDPOINT_ID]?: Address };

export const STARGATE_POOL_USDC = {
    [arbitrum.id]: "0xe8CDF27AcD73a434D661C84887215F7598e7d0d3",
    [bsc.id]: "0x962Bd449E630b0d928f308Ce63f1A21F02576057",
    [mainnet.id]: "0xc026395860Db2d07ee33e05fE50ed7bD583189C7",
    [optimism.id]: "0xcE8CcA271Ebc0533920C83d39F417ED6A0abB7D0",
};

export const STARGATE_NATIVE_TOKEN_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
