import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";
import { Address, encodeAbiParameters, encodeDeployData, keccak256, zeroAddress, zeroHash } from "viem";
import { MockERC20 } from "../artifacts/MockERC20.js";
import { inkSepolia, interopDevnet0, interopDevnet1, opChainA, opChainL1, unichainSepolia } from "../chains/index.js";
import { getHypERC20Address, getHypERC20CollateralAddress, getMailboxAddress } from "./hyperlane.js";
import { createPoolKey } from "../types/PoolKey.js";
import { HypERC20CollateralToken, HypERC20Token, NativeToken, Token, TokenBase } from "../types/Token.js";
import { arbitrumSepolia, base, baseSepolia, bsc, localhost, optimismSepolia, sepolia } from "viem/chains";
import { HypERC20 } from "../artifacts/index.js";

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

const ethNativeTokens = [sepolia, optimismSepolia, arbitrumSepolia, baseSepolia, opChainL1, opChainA].map(
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

export const LOCAL_TOKENS: (HypERC20CollateralToken | HypERC20Token | NativeToken)[] = [
    ...createMockERC20WarpRoute({
        token: mockTokens[0],
        connectionChainIds: [opChainA.id],
    }),
    ...createMockERC20WarpRoute({
        token: mockTokens[1],
        connectionChainIds: [opChainA.id],
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
        createPoolKey({
            currency0: zeroAddress,
            currency1: mockTokens[0].address,
            fee: 3000,
            tickSpacing: 60,
            hooks: zeroAddress,
        }),
    ],
};

// TODO: Remove everything below?

export const getSyntheticTokenAddress = (
    chainId: number,
    totalSupply: bigint,
    decimals: number,
    name: string,
    symbol: string,
    msgSender: Address = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
) => {
    const mailbox = getMailboxAddress({ chainId });

    return getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            bytecode: HypERC20.bytecode,
            abi: HypERC20.abi,
            args: [decimals, mailbox],
        }),
        salt: keccak256(
            encodeAbiParameters(
                [{ type: "uint256" }, { type: "string" }, { type: "string" }, { type: "address" }],
                [totalSupply, name, symbol, msgSender],
            ),
        ),
    });
};

export const TOKEN_A = getDeployDeterministicAddress({
    bytecode: encodeDeployData({
        bytecode: MockERC20.bytecode,
        abi: MockERC20.abi,
        args: ["Token A", "A", 18],
    }),
    salt: zeroHash,
});
export const TOKEN_B = getDeployDeterministicAddress({
    bytecode: encodeDeployData({
        bytecode: MockERC20.bytecode,
        abi: MockERC20.abi,
        args: ["Token B", "B", 18],
    }),
    salt: zeroHash,
});

export const SYNTH_TOKEN_A_901 = getSyntheticTokenAddress(901, 0n, 18, "Synth Token A", "sA");
export const SYNTH_TOKEN_B_901 = getSyntheticTokenAddress(901, 0n, 18, "Synth Token B", "sB");

export const TOKEN_LIST = {
    // 56
    BNB: { name: "BNB", symbol: "BNB", decimals: 8, address: zeroAddress, chainId: bsc.id },
    USDC_BSC: {
        name: "USDC",
        symbol: "USDC",
        decimals: 6,
        address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
        chainId: bsc.id,
    },
    SOL: {
        name: "Solana",
        symbol: "SOL",
        decimals: 18,
        address: "0x570A5D26f7765Ecb712C0924E4De545B89fD43dF",
        chainId: bsc.id,
    },
    // 8453
    USDC_BASE: {
        name: "USDC",
        symbol: "USDC",
        decimals: 6,
        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        chainId: base.id,
    },
    VIRTUAL_BASE: {
        name: "Virtual",
        symbol: "VIRTUAL",
        decimals: 18,
        address: "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b",
        chainId: base.id,
    },
    // 1337
    TokenA_1337: {
        name: "Local Token A",
        symbol: "lA",
        decimals: 18,
        address: TOKEN_A,
        chainId: 1337,
    },
    TokenB_1337: {
        name: "Local Token B",
        symbol: "lB",
        decimals: 18,
        address: TOKEN_B,
        chainId: 1337,
    },
    testUSDC_1337: {
        name: "test USDC",
        symbol: "tUSDC",
        decimals: 6,
        address: "0x7f3aa3c525A3CDBd09488BDa5e36D68977490c41",
        chainId: localhost.id,
    },
    tokenA_LOCAL_OP: {
        name: "OP Token A",
        symbol: "opA",
        decimals: 18,
        address: TOKEN_A,
        chainId: opChainL1.id,
    },
    tokenB_LOCAL_OP: {
        name: "OP Token B",
        symbol: "opB",
        decimals: 18,
        address: TOKEN_B,
        chainId: opChainL1.id,
    },
    synthTokenA_LOCAL_OP_CHAIN_A: {
        name: "Synth Token A",
        symbol: "sA",
        decimals: 18,
        address: SYNTH_TOKEN_A_901,
        chainId: opChainA.id,
    },
    synthTokenB_LOCAL_OP_CHAIN_A: {
        name: "Synth Token B",
        symbol: "sB",
        decimals: 18,
        address: SYNTH_TOKEN_B_901,
        chainId: opChainA.id,
    },
    // 11155111
    TokenA_SEPOLIA: {
        name: "Token A",
        symbol: "A",
        decimals: 18,
        address: "0xfa306dfde7632a6c74bdabbbb19fa59c7a78d73b",
        chainId: sepolia.id,
    },
    TokenB_SEPOLIA: {
        name: "Token B",
        symbol: "B",
        decimals: 18,
        address: "0xf79509e6fadc7254d59d49bcd976d5523177ec4f",
        chainId: sepolia.id,
    },
    TokenA_ARBI_SEPOLIA: {
        name: "Token A For Arbi",
        symbol: "Aarbi",
        decimals: 18,
        address: "0x6A9996e0aeB928820cFa1a1dB7C62bA61B473280",
        chainId: sepolia.id,
    },
    TokenB_ARBI_SEPOLIA: {
        name: "Token B For Arbi",
        symbol: "Barbi",
        decimals: 18,
        address: "0x500a80035829572e8E637dC654AE32bC2560968F",
        chainId: sepolia.id,
    },
    // 421614
    testUSDC_ARBITRUM: {
        name: "test USDC",
        symbol: "tUSDC",
        decimals: 6,
        address: "0x7f3aa3c525A3CDBd09488BDa5e36D68977490c41",
        chainId: arbitrumSepolia.id,
    },
    TokenA_ARBITRUM: {
        name: "Token A For Arbi",
        symbol: "Aarbi",
        decimals: 18,
        address: "0x070b1315bc9fCBD8F784f6556257e7D5c4c11900",
        chainId: arbitrumSepolia.id,
    },
    // 84532
    TokenA_BASE_SEPOLIA: {
        name: "Token A",
        symbol: "A",
        decimals: 18,
        address: "0x05cad57113cb3fa213982dc9553498018c1d08b7",
        chainId: baseSepolia.id,
    },
    TokenB_BASE_SEPOLIA: {
        name: "Token B",
        symbol: "B",
        decimals: 18,
        address: "0x3744d204595af66329b325a7651b005fbdcd77a4",
        chainId: baseSepolia.id,
    },
    // 1301
    TokenA_UNICHAIN_SEPOLIA: {
        name: "Token A",
        symbol: "A",
        decimals: 18,
        address: "0x274d622afa517251bdf73ea08377b78dd9f49f2b",
        chainId: unichainSepolia.id,
    },
    TokenB_UNICHAIN_SEPOLIA: {
        name: "Token B",
        symbol: "B",
        decimals: 18,
        address: "0x5983458d6d58b80257744872a778ece9e82ceec0",
        chainId: unichainSepolia.id,
    },
    // 763373
    TokenA_INK_SEPOLIA: {
        name: "Token A",
        symbol: "A",
        decimals: 18,
        address: "0x274d622afa517251bdf73ea08377b78dd9f49f2b",
        chainId: inkSepolia.id,
    },
    TokenB_INK_SEPOLIA: {
        name: "Token B",
        symbol: "B",
        decimals: 18,
        address: "0x5980x5983458d6d58b80257744872a778ece9e82ceec0",
        chainId: inkSepolia.id,
    },
    // 420120000
    SuperA_DEV0: {
        name: "Super A",
        symbol: "A",
        decimals: 18,
        address: "0x48824f0345964d1002bf4ddd1f72ba99b5dbe5d5",
        chainId: interopDevnet0.id,
    },
    SuperB_DEV0: {
        name: "Super B",
        symbol: "B",
        decimals: 18,
        address: "0x5710586e8d18f2e1c54c7a2247c1977578b11809",
        chainId: interopDevnet0.id,
    },
    superC_DEV0: {
        name: "Super C",
        symbol: "C",
        decimals: 18,
        address: "0x41e797a36be6636c7b07a3c829817d6ac019ac55",
        chainId: interopDevnet0.id,
    },
    superD_DEV0: {
        name: "Super D",
        symbol: "D",
        decimals: 18,
        address: "0xe236a0959dc8d2dbeb0496d40df0cc112e43adc5",
        chainId: interopDevnet0.id,
    },
    superE_DEV0: {
        name: "Super E",
        symbol: "E",
        decimals: 18,
        address: "0x323ca01033701674011505da2d9958ce33fd7b7c",
        chainId: interopDevnet0.id,
    },
    superF_DEV0: {
        name: "Super F",
        symbol: "F",
        decimals: 18,
        address: "0x0afb6bd539a527dae4fee019cb7d5de946b10eee",
        chainId: interopDevnet0.id,
    },
    // 420120001
    SuperA_DEV1: {
        name: "Super A",
        symbol: "A",
        decimals: 18,
        address: "0x48824f0345964d1002bf4ddd1f72ba99b5dbe5d5",
        chainId: interopDevnet1.id,
    },
    SuperB_DEV1: {
        name: "Super B",
        symbol: "B",
        decimals: 18,
        address: "0x5710586e8d18f2e1c54c7a2247c1977578b11809",
        chainId: interopDevnet1.id,
    },
    superC_DEV1: {
        name: "Super C",
        symbol: "C",
        decimals: 18,
        address: "0x41e797a36be6636c7b07a3c829817d6ac019ac55",
        chainId: interopDevnet1.id,
    },
    superD_DEV1: {
        name: "Super D",
        symbol: "D",
        decimals: 18,
        address: "0xe236a0959dc8d2dbeb0496d40df0cc112e43adc5",
        chainId: interopDevnet1.id,
    },
    superE_DEV1: {
        name: "Super E",
        symbol: "E",
        decimals: 18,
        address: "0x323ca01033701674011505da2d9958ce33fd7b7c",
        chainId: interopDevnet1.id,
    },
    superF_DEV1: {
        name: "Super F",
        symbol: "F",
        decimals: 18,
        address: "0x0afb6bd539a527dae4fee019cb7d5de946b10eee",
        chainId: interopDevnet1.id,
    },
} as const;
