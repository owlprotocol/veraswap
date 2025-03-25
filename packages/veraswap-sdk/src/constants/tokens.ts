import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";
import { Address, encodeDeployData, zeroAddress, zeroHash } from "viem";
import { MockERC20 } from "../artifacts/MockERC20.js";
import { opChainA, opChainL1 } from "../chains/index.js";
import { getHypERC20Address, getHypERC20CollateralAddress, getMailboxAddress } from "./hyperlane.js";
import { createPoolKey } from "../types/PoolKey.js";

export function getMockERC20Address({ name, symbol, decimals }: { name: string; symbol: string; decimals: number }) {
    return getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            bytecode: MockERC20.bytecode,
            abi: MockERC20.abi,
            args: [name, symbol, decimals],
        }),
        salt: zeroHash,
    });
}

export type TokenStandard = "ERC20" | "MockERC20" | "HypERC20" | "HypERC20Collateral" | "SuperchainERC20";

export interface Token<T extends TokenStandard = TokenStandard> {
    standard: T;
    chainId: number;
    address: Address;
    decimals: number;
    name: string;
    symbol: string;
    logoURI?: string;
}

export interface HypERC20Token extends Token<"HypERC20"> {
    connections: {
        vm: string;
        chainId: number;
        address: Address;
    }[];
}

export interface HypERC20CollateralToken extends Token<"HypERC20Collateral"> {
    collateralAddress: Address;
    connections: {
        vm: string;
        chainId: number;
        address: Address;
    }[];
}

/**
 * Create a MockERC20, HypERC20Collateral, HypERC20Synthetic
 */
export function createMockERC20WarpRoute({
    token,
    connectionChainIds,
    msgSender,
}: {
    token: Token<"MockERC20">;
    connectionChainIds: number[];
    msgSender?: Address;
}): [HypERC20CollateralToken, ...HypERC20Token[]] {
    const hypERC20CollateralAddress = getHypERC20CollateralAddress({
        erc20: token.address,
        mailbox: getMailboxAddress({ chainId: token.chainId }),
    });
    const hypERC20Collateral: HypERC20CollateralToken = {
        ...token,
        standard: "HypERC20Collateral",
        address: hypERC20CollateralAddress,
        collateralAddress: token.address,
        connections: [],
    };

    const hypERC20s = connectionChainIds.map((chainId) => {
        const address = getHypERC20Address({
            decimals: token.decimals,
            mailbox: getMailboxAddress({ chainId }),
            totalSupply: 0n,
            name: token.name,
            symbol: token.symbol,
            msgSender: msgSender ?? "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        });
        return {
            ...token,
            standard: "HypERC20",
            chainId,
            address,
            connections: [],
        } as HypERC20Token;
    });

    const tokens = [hypERC20Collateral, ...hypERC20s];
    tokens.forEach((token) => {
        token.connections = tokens
            .filter((t) => t.chainId != token.chainId)
            .map((t) => {
                return {
                    vm: "evm",
                    chainId: t.chainId,
                    address: t.address,
                };
            });
    });

    return tokens as [HypERC20CollateralToken, ...HypERC20Token[]];
}

const mockTokens: Token<"MockERC20">[] = [
    {
        standard: "MockERC20",
        chainId: opChainL1.id,
        address: getMockERC20Address({ name: "Token A", symbol: "A", decimals: 18 }),
        name: "Token A",
        symbol: "A",
        decimals: 18,
    },
    {
        standard: "MockERC20",
        chainId: opChainL1.id,
        address: getMockERC20Address({ name: "Token B", symbol: "B", decimals: 18 }),
        name: "Token B",
        symbol: "B",
        decimals: 18,
    },
];

export const LOCAL_TOKENS: (HypERC20CollateralToken | HypERC20Token)[] = [
    ...createMockERC20WarpRoute({
        token: mockTokens[0],
        connectionChainIds: [opChainA.id],
    }),
    ...createMockERC20WarpRoute({
        token: mockTokens[1],
        connectionChainIds: [opChainA.id],
    }),
];

export const LOCAL_POOLS = {
    [opChainL1.id]: [
        createPoolKey({
            currency0: mockTokens[0].address,
            currency1: mockTokens[1].address,
            fee: 3000,
            tickSpacing: 60,
            hooks: zeroAddress,
        }),
    ],
};
