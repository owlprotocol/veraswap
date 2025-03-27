import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";
import { Address, encodeDeployData, zeroAddress, zeroHash } from "viem";
import { MockERC20 } from "../artifacts/MockERC20.js";
import { opChainA, opChainL1 } from "../chains/index.js";
import { getHypERC20Address, getHypERC20CollateralAddress, getMailboxAddress } from "./hyperlane.js";
import { createPoolKey } from "../types/PoolKey.js";
import { HypERC20CollateralToken, HypERC20Token, Token, TokenBase } from "../types/Token.js";

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

/**
 * Create a MockERC20, HypERC20Collateral, HypERC20Synthetic
 */
export function createMockERC20WarpRoute({
    token,
    connectionChainIds,
    msgSender,
}: {
    token: TokenBase<"MockERC20">;
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

const mockTokens: TokenBase<"MockERC20">[] = [
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

export function createTokenMap(tokens: Token[]): Record<number, Record<Address, Token>> {
    const data: Record<number, Record<Address, Token>> = {};
    tokens.forEach((token) => {
        if (!data[token.chainId]) data[token.chainId] = {};
        data[token.chainId][token.address] = token;
    });

    return data;
}

export const LOCAL_TOKENS_MAP = createTokenMap([...mockTokens, ...LOCAL_TOKENS]);

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
