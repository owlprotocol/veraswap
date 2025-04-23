import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";
import invariant from "tiny-invariant";
import { Address, encodeDeployData, zeroAddress, zeroHash } from "viem";
import { arbitrumSepolia, baseSepolia, optimismSepolia, sepolia } from "viem/chains";

import { MockERC20, MockSuperchainERC20 } from "../artifacts/index.js";
import { interopDevnet0, interopDevnet1, opChainA, opChainB, opChainL1, unichainSepolia } from "../chains/index.js";
import { createPoolKey } from "../types/PoolKey.js";
import {
    HypERC20CollateralToken,
    HypERC20Token,
    HypSuperchainERC20CollateralToken,
    NativeToken,
    Token,
    TokenBase,
} from "../types/Token.js";

import { getHypERC20Address, getHypERC20CollateralAddress, LOCAL_HYPERLANE_CONTRACTS } from "./hyperlane.js";

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

export function getMockSuperchainERC20Address({
    name,
    symbol,
    decimals,
}: {
    name: string;
    symbol: string;
    decimals: number;
}) {
    return getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            bytecode: MockSuperchainERC20.bytecode,
            abi: MockSuperchainERC20.abi,
            args: [name, symbol, decimals],
        }),
        salt: zeroHash,
    });
}

const localSuperChains = [opChainA.id, opChainB.id] as const;

/**
 * Generate the `connections` field in tokens by connecting them to each other
 * @param tokens
 * @returns
 */
export function connectTokens<T extends { chainId: number; address: Address } = { chainId: number; address: Address }>(
    tokens: T[],
) {
    return tokens.map((token) => {
        return {
            ...token,
            connections: tokens
                .filter((t) => t.chainId != token.chainId)
                .map((t) => {
                    return {
                        vm: "evm",
                        chainId: t.chainId,
                        address: t.address,
                    };
                }),
        };
    });
}

/**
 * Create a MockERC20, HypERC20Collateral, HypERC20Synthetic
 */
export function createMockERC20WarpRoute({
    token,
    mailboxByChain,
    msgSender = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
}: {
    token: TokenBase<"MockERC20">;
    mailboxByChain: Record<number, Address>;
    msgSender?: Address;
}): [HypERC20CollateralToken, ...HypERC20Token[]] {
    const mailbox = mailboxByChain[token.chainId];
    invariant(mailbox != undefined, `Mailbox not found for token chainId ${token.chainId}`);

    const hypERC20CollateralAddress = getHypERC20CollateralAddress({
        erc20: token.address,
        mailbox,
    });
    const hypERC20Collateral: HypERC20CollateralToken = {
        ...token,
        standard: "HypERC20Collateral",
        address: hypERC20CollateralAddress,
        collateralAddress: token.address,
        connections: [],
    };

    const connections = Object.entries(mailboxByChain)
        .filter(([chainId]) => chainId != `${token.chainId}`)
        .map(([chainId, mailbox]) => {
            return { chainId: parseInt(chainId), mailbox };
        });

    const hypERC20s = connections.map(({ chainId, mailbox }) => {
        const address = getHypERC20Address({
            decimals: token.decimals,
            mailbox,
            totalSupply: 0n,
            name: token.name,
            symbol: token.symbol,
            msgSender,
        });
        return {
            ...token,
            standard: "HypERC20",
            chainId,
            address,
            connections: [],
        } as HypERC20Token;
    });

    const tokens = connectTokens([hypERC20Collateral, ...hypERC20s]);
    return tokens as [HypERC20CollateralToken, ...HypERC20Token[]];
}

const testnetSuperChains = [interopDevnet0.id, interopDevnet1.id] as const;

/** Connect mock superchain erc20s to each other, without hyperlane */
export function connectTestnetMockSuperchainERC20(token: TokenBase<"MockSuperchainERC20">) {
    const superchainConnections: TokenBase["connections"] = testnetSuperChains.map((chainId) => ({
        vm: "evm",
        chainId,
        address: token.address,
    }));

    return testnetSuperChains.map(
        (chainId) =>
            ({
                ...token,
                standard: "SuperchainERC20",
                chainId,
                chonnections: superchainConnections.filter((c) => c.chainId != chainId),
            }) as TokenBase<"SuperchainERC20">,
    );
}

/** Connect mock superchain erc20s to each other, with hyperlane */
export function createMockSuperchainERC20WarpRoute({
    token,
    remoteChain,
    msgSender = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
}: {
    token: TokenBase<"MockSuperchainERC20">;
    remoteChain: keyof typeof LOCAL_HYPERLANE_CONTRACTS;
    msgSender?: Address;
}) {
    const mailbox = LOCAL_HYPERLANE_CONTRACTS[token.chainId as keyof typeof LOCAL_HYPERLANE_CONTRACTS].mailbox;
    invariant(mailbox != undefined, `Mailbox not found for token chainId ${token.chainId}`);
    const mailboxRemote = LOCAL_HYPERLANE_CONTRACTS[remoteChain].mailbox;
    invariant(mailboxRemote != undefined, `Mailbox not found for token chainId ${remoteChain}`);

    const hypERC20CollateralAddress = getHypERC20CollateralAddress({
        erc20: token.address,
        mailbox,
    });

    const hypERC20Address = getHypERC20Address({
        decimals: token.decimals,
        mailbox: mailboxRemote,
        totalSupply: 0n,
        name: token.name,
        symbol: token.symbol,
        msgSender,
    });

    const hypERC20 = {
        ...token,
        standard: "HypERC20",
        chainId: opChainL1.id,
        address: hypERC20Address,
        connections: [
            {
                vm: "evm",
                chainId: token.chainId,
                address: hypERC20CollateralAddress,
            },
        ],
    } as HypERC20Token;

    const superchainConnections: TokenBase["connections"] = localSuperChains.map((chainId) => ({
        vm: "evm",
        chainId,
        address: token.address,
    }));

    const hypSuperchainERC20Collateral: HypSuperchainERC20CollateralToken = {
        ...token,
        standard: "HypSuperchainERC20Collateral",
        address: hypERC20CollateralAddress,
        collateralAddress: token.address,
        connections: [
            ...superchainConnections.filter((c) => c.chainId != token.chainId),
            {
                vm: "evm",
                chainId: opChainL1.id,
                address: hypERC20Address,
            },
        ],
    };

    const superchainERC20s = localSuperChains
        .filter((cId) => token.chainId != cId)
        .map(
            (chainId) =>
                ({
                    ...token,
                    standard: "SuperchainERC20",
                    chainId,
                    connections: superchainConnections.filter((c) => c.chainId != chainId),
                }) as TokenBase<"SuperchainERC20">,
        );

    return [hypSuperchainERC20Collateral, hypERC20, ...superchainERC20s];
}

export const localMockTokens = [
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
    {
        standard: "MockSuperchainERC20",
        chainId: opChainA.id,
        address: getMockSuperchainERC20Address({ name: "Token C", symbol: "C", decimals: 18 }),
        name: "Token C",
        symbol: "C",
        decimals: 18,
    },
    {
        standard: "MockSuperchainERC20",
        chainId: opChainB.id,
        address: getMockSuperchainERC20Address({ name: "Token D", symbol: "D", decimals: 18 }),
        name: "Token D",
        symbol: "D",
        decimals: 18,
    },
    {
        standard: "MockSuperchainERC20",
        chainId: opChainB.id,
        address: getMockSuperchainERC20Address({ name: "Token C", symbol: "C", decimals: 18 }),
        name: "Token C",
        symbol: "C",
        decimals: 18,
    },
    {
        standard: "MockSuperchainERC20",
        chainId: opChainA.id,
        address: getMockSuperchainERC20Address({ name: "Token D", symbol: "D", decimals: 18 }),
        name: "Token D",
        symbol: "D",
        decimals: 18,
    },
] as const satisfies TokenBase<"MockERC20" | "MockSuperchainERC20">[];

const ethNativeTokens = [
    sepolia,
    optimismSepolia,
    arbitrumSepolia,
    baseSepolia,
    opChainL1,
    opChainA,
    opChainB,
    interopDevnet0,
    interopDevnet1,
].map(
    (chain) =>
        ({
            chainId: chain.id,
            ...chain.nativeCurrency,
            name: "Ether",
            standard: "NativeToken",
            address: zeroAddress,
            logoURI: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
        }) satisfies NativeToken,
);

export const LOCAL_TOKENS: (
    | HypERC20CollateralToken
    | HypERC20Token
    | NativeToken
    | TokenBase<"SuperchainERC20">
    | HypSuperchainERC20CollateralToken
)[] = [
    ...createMockERC20WarpRoute({
        token: localMockTokens[0],
        mailboxByChain: {
            [opChainL1.id]: LOCAL_HYPERLANE_CONTRACTS[opChainL1.id].mailbox,
            [opChainA.id]: LOCAL_HYPERLANE_CONTRACTS[opChainA.id].mailbox,
            [opChainB.id]: LOCAL_HYPERLANE_CONTRACTS[opChainB.id].mailbox,
        },
    }),
    ...createMockERC20WarpRoute({
        token: localMockTokens[1],
        mailboxByChain: {
            [opChainL1.id]: LOCAL_HYPERLANE_CONTRACTS[opChainL1.id].mailbox,
            [opChainA.id]: LOCAL_HYPERLANE_CONTRACTS[opChainA.id].mailbox,
            [opChainB.id]: LOCAL_HYPERLANE_CONTRACTS[opChainB.id].mailbox,
        },
    }),
    ...createMockSuperchainERC20WarpRoute({
        token: localMockTokens[2],
        remoteChain: opChainL1.id,
    }),
    ...createMockSuperchainERC20WarpRoute({
        token: localMockTokens[3],
        remoteChain: opChainL1.id,
    }),
    ...ethNativeTokens,
];

export function createTokenMap(tokens: Token[]): Record<number, Record<Address, Token>> {
    const data: Record<number, Record<Address, Token>> = {};
    tokens.forEach((token) => {
        if (!data[token.chainId]) data[token.chainId] = {};
        data[token.chainId][token.address] = token;
    });

    return data;
}

export const LOCAL_TOKENS_MAP = createTokenMap([...localMockTokens, ...LOCAL_TOKENS]);

export const LOCAL_POOLS = {
    [opChainL1.id]: [
        createPoolKey({
            currency0: localMockTokens[0].address,
            currency1: localMockTokens[1].address,
            fee: 3000,
            tickSpacing: 60,
            hooks: zeroAddress,
        }),
        createPoolKey({
            currency0: zeroAddress,
            currency1: localMockTokens[0].address,
            fee: 3000,
            tickSpacing: 60,
            hooks: zeroAddress,
        }),
    ],
    [opChainA.id]: [
        createPoolKey({
            currency0: zeroAddress,
            currency1: localMockTokens[2].address,
            fee: 3000,
            tickSpacing: 60,
            hooks: zeroAddress,
        }),
    ],
    [opChainB.id]: [
        createPoolKey({
            currency0: zeroAddress,
            currency1: localMockTokens[3].address,
            fee: 3000,
            tickSpacing: 60,
            hooks: zeroAddress,
        }),
    ],
};

export const testnetMockTokens = [
    {
        standard: "MockERC20",
        chainId: sepolia.id,
        address: "0x6b821901f606F2216436CACA965c3B89cB4f1240",
        name: "Token C",
        symbol: "C",
        decimals: 18,
    },
    {
        standard: "MockERC20",
        chainId: sepolia.id,
        address: "0x37c6E14d5BB318f211f71e92857794fD9Dd97Ee9",
        name: "Token D",
        symbol: "D",
        decimals: 18,
    },
    {
        standard: "MockSuperchainERC20",
        chainId: interopDevnet0.id,
        address: "0x2Eb2838feBfB326803fF33C4F54cd2d3561ce6Ed",
        name: "Token C",
        symbol: "C",
        decimals: 18,
    },
    {
        standard: "MockSuperchainERC20",
        chainId: interopDevnet1.id,
        address: "0x432EE6707eA6A11dBF889fABc12F2d51c6fA79A6",
        name: "Token D",
        symbol: "D",
        decimals: 18,
    },
    {
        standard: "MockSuperchainERC20",
        chainId: interopDevnet1.id,
        address: "0x2Eb2838feBfB326803fF33C4F54cd2d3561ce6Ed",
        name: "Token C",
        symbol: "C",
        decimals: 18,
    },
    {
        standard: "MockSuperchainERC20",
        chainId: interopDevnet0.id,
        address: "0x432EE6707eA6A11dBF889fABc12F2d51c6fA79A6",
        name: "Token D",
        symbol: "D",
        decimals: 18,
    },
] as const;

//TODO: Helper to generate this using params (but not use bytecode)?
const TESTNET_TOKENS: (
    | HypERC20CollateralToken
    | HypERC20Token
    | NativeToken
    | TokenBase<"SuperchainERC20">
    | HypSuperchainERC20CollateralToken
)[] = [
    ...connectTokens([
        {
            standard: "HypERC20Collateral",
            chainId: sepolia.id,
            address: "0x3127Fc42fD0a8fB9E1A342D01C5F89Dd84f78F50",
            collateralAddress: testnetMockTokens[0].address,
            name: "Token C",
            symbol: "C",
            decimals: 18,
            connections: [],
        },
        {
            standard: "HypERC20",
            chainId: optimismSepolia.id,
            address: "0x640C4647858C4FF1a9e72Ce0A2De1ef74641D954",
            name: "Token C",
            symbol: "C",
            decimals: 18,
            connections: [],
        },
        {
            standard: "HypERC20",
            chainId: unichainSepolia.id,
            address: "0x5cED2AC3066a17c0A2ed31F95DcDC9fd5C19DAbB",
            name: "Token C",
            symbol: "C",
            decimals: 18,
            connections: [],
        },
    ] as (HypERC20CollateralToken | HypERC20Token)[]),
    ...(connectTokens([
        {
            standard: "HypERC20Collateral",
            chainId: sepolia.id,
            address: "0xc6BCbD4B62FA6f088DB0f3D668fbFE235CB014fC",
            collateralAddress: testnetMockTokens[1].address,
            name: "Token D",
            symbol: "D",
            decimals: 18,
            connections: [],
        },
        {
            standard: "HypERC20",
            chainId: optimismSepolia.id,
            address: "0xE76f05585813d2736348F6AEeFbD94927813b4Cb",
            name: "Token D",
            symbol: "D",
            decimals: 18,
            connections: [],
        },
        {
            standard: "HypERC20",
            chainId: unichainSepolia.id,
            address: "0x82B7EF712a532F9Dd068cd1B3ddf3948c1BBE39D",
            name: "Token D",
            symbol: "D",
            decimals: 18,
            connections: [],
        },
    ]) as (HypERC20CollateralToken | HypERC20Token)[]),
    ...connectTestnetMockSuperchainERC20(testnetMockTokens[2]),
    ...connectTestnetMockSuperchainERC20(testnetMockTokens[3]),
];

const TESTNET_TOKENS_MAP = createTokenMap([...testnetMockTokens, ...TESTNET_TOKENS]);

const TESTNET_POOLS = {
    [sepolia.id]: [
        createPoolKey({
            currency0: testnetMockTokens[0].address,
            currency1: testnetMockTokens[1].address,
            fee: 3000,
            tickSpacing: 60,
            hooks: zeroAddress,
        }),
    ],
    [interopDevnet0.id]: [
        createPoolKey({
            currency0: testnetMockTokens[2].address,
            currency1: testnetMockTokens[5].address,
            fee: 3000,
            tickSpacing: 60,
            hooks: zeroAddress,
        }),
    ],
};

export const TOKENS = [...LOCAL_TOKENS, ...TESTNET_TOKENS];
export const TOKENS_MAP = { ...LOCAL_TOKENS_MAP, ...TESTNET_TOKENS_MAP };
export const POOLS = { ...LOCAL_POOLS, ...TESTNET_POOLS };
