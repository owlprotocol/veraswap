import { zeroAddress, zeroHash, encodeDeployData, defineChain } from "viem";
import { getDeployDeterministicAddress } from "@owlprotocol/create-deterministic";
import { type ChainMap, type ChainMetadata } from "@hyperlane-xyz/sdk";
import { mainnet, bsc, base, arbitrum, arbitrumSepolia, sepolia } from "viem/chains";
import { UnsupportedProtocol, MockERC20 } from "./artifacts/index.js";
import { HyperlaneRegistry, PoolKey } from "./types/index.js";
import { TokenBridgeMap } from "./types/TokenBridgeMap.js";

export const MAX_UINT_256 = 2n ** 256n - 1n;
export const MAX_UINT_160 = 2n ** 160n - 1n;
export const MAX_UINT_48 = 2 ** 48 - 1;
export const V4_SWAP = 0x10;

export const PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3";
export const UNSUPPORTED_PROTOCOL = getDeployDeterministicAddress({
    bytecode: UnsupportedProtocol.bytecode,
    salt: zeroHash,
});

export const UNIVERSAL_ROUTER = "0x8C29321D10039d36dB8d084009761D79c2707B6d";
export const POOL_MANAGER = "0x9992a639900866aFDE75D714c8Ef76edA447A18c";
export const POSITION_MANAGER = "0x9737f068eb64a1328B7A323370DDf836d3a446BD";
export const QUOTER = "0x8B163bB00AE59d3c1b79F3e63798087C40ea7AE8";
export const STATE_VIEW = "0x3282543F6117a031a2a2c8Cf535Aebdd0Dde0887";

// export const POOL_MANAGER = getDeployDeterministicAddress({
//     bytecode: encodeDeployData({
//         bytecode: PoolManager.bytecode,
//         abi: PoolManager.abi,
//         args: [zeroAddress],
//     }),
//     salt: zeroHash,
// });
// export const POSITION_MANAGER = getDeployDeterministicAddress({
//     bytecode: encodeDeployData({
//         bytecode: PositionManager.bytecode,
//         abi: PositionManager.abi,
//         args: [POOL_MANAGER, PERMIT2_ADDRESS, 300_000n, zeroAddress, zeroAddress],
//     }),
//     salt: zeroHash,
// });
// export const UNIVERSAL_ROUTER = getDeployDeterministicAddress({
//     bytecode: encodeDeployData({
//         bytecode: UniversalRouter.bytecode,
//         abi: UniversalRouter.abi,
//         args: [
//             {
//                 permit2: PERMIT2_ADDRESS,
//                 weth9: zeroAddress,
//                 v2Factory: zeroAddress,
//                 v3Factory: zeroAddress,
//                 pairInitCodeHash: zeroHash,
//                 poolInitCodeHash: zeroHash,
//                 v4PoolManager: POOL_MANAGER,
//                 v3NFTPositionManager: zeroAddress,
//                 v4PositionManager: POSITION_MANAGER,
//             },
//         ],
//     }),
//     salt: zeroHash,
// });

// export const QUOTER = getDeployDeterministicAddress({
//     bytecode: encodeDeployData({
//         bytecode: V4Quoter.bytecode,
//         abi: V4Quoter.abi,
//         args: [POOL_MANAGER],
//     }),
//     salt: zeroHash,
// });
// export const STATE_VIEW = getDeployDeterministicAddress({
//     bytecode: encodeDeployData({
//         bytecode: StateView.bytecode,
//         abi: StateView.abi,
//         args: [POOL_MANAGER],
//     }),
//     salt: zeroHash,
// });

export const MOCK_A = getDeployDeterministicAddress({
    bytecode: encodeDeployData({
        bytecode: MockERC20.bytecode,
        abi: MockERC20.abi,
        args: ["MockA", "A", 18],
    }),
    salt: zeroHash,
});
export const MOCK_B = getDeployDeterministicAddress({
    bytecode: encodeDeployData({
        bytecode: MockERC20.bytecode,
        abi: MockERC20.abi,
        args: ["MockB", "B", 18],
    }),
    salt: zeroHash,
});

export const UNISWAP_CONTRACTS = {
    [mainnet.id]: {
        POOL_MANAGER: "0x000000000004444c5dc75cB358380D2e3dE08A90",
        POSITION_MANAGER: "0xbd216513d74c8cf14cf4747e6aaa6420ff64ee9e",
        UNIVERSAL_ROUTER: "0x66a9893cc07d91d95644aedd05d03f95e1dba8af",
        QUOTER: "0x52f0e24d1c21c8a0cb1e5a5dd6198556bd9e1203",
        STATE_VIEW: "0x7ffe42c4a5deea5b0fec41c94c136cf115597227",
    },
    [bsc.id]: {
        POOL_MANAGER: "0x28e2ea090877bf75740558f6bfb36a5ffee9e9df",
        POSITION_MANAGER: "0x7a4a5c919ae2541aed11041a1aeee68f1287f95b",
        UNIVERSAL_ROUTER: "0x1906c1d672b88cd1b9ac7593301ca990f94eae07",
        QUOTER: "0x9f75dd27d6664c475b90e105573e550ff69437b0",
        STATE_VIEW: "0xd13dd3d6e93f276fafc9db9e6bb47c1180aee0c4",
    },
    [base.id]: {
        POOL_MANAGER: "0x498581ff718922c3f8e6a244956af099b2652b2b",
        POSITION_MANAGER: "0x7c5f5a4bbd8fd63184577525326123b519429bdc",
        UNIVERSAL_ROUTER: "0x6ff5693b99212da76ad316178a184ab56d299b43",
        QUOTER: "0x0d5e0f971ed27fbff6c2837bf31316121532048d",
        STATE_VIEW: "0xa3c0c9b65bad0b08107aa264b0f3db444b867a71",
    },
    [arbitrum.id]: {
        POOL_MANAGER: "0x360e68faccca8ca495c1b759fd9eee466db9fb32",
        POSITION_MANAGER: "0xd88f38f930b7952f2db2432cb002e7abbf3dd869",
        UNIVERSAL_ROUTER: "0xa51afafe0263b40edaef0df8781ea9aa03e381a3",
        QUOTER: "0x3972c00f7ed4885e145823eb7c655375d275a1c5",
        STATE_VIEW: "0x76fd297e2d437cd7f76d50f01afe6160f86e9990",
    },
    [1337]: {
        UNSUPPORTED_PROTOCOL,
        POOL_MANAGER,
        POSITION_MANAGER,
        UNIVERSAL_ROUTER,
        QUOTER,
        STATE_VIEW,
    },
    [1338]: {
        UNSUPPORTED_PROTOCOL,
        POOL_MANAGER,
        POSITION_MANAGER,
        UNIVERSAL_ROUTER,
        QUOTER,
        STATE_VIEW,
    },
    [sepolia.id]: {
        POOL_MANAGER: "0xE03A1074c86CFeDd5C142C4F04F1a1536e203543",
        // UNIVERSAL_ROUTER: "0x3a9d48ab9751398bbfa63ad67599bb04e4bdf98b",
        UNIVERSAL_ROUTER: "0xa14895f23a3a5a4d76799e02ebebc6df3cbe61d6",
        POSITION_MANAGER: "0x429ba70129df741B2Ca2a85BC3A2a3328e5c09b4",
        STATE_VIEW: "0xe1dd9c3fa50edb962e442f60dfbc432e24537e4c",
        QUOTER: "0x61b3f2011a92d183c7dbadbda940a7555ccf9227",
    },
    [arbitrumSepolia.id]: {
        POOL_MANAGER: "0xFB3e0C6F74eB1a21CC1Da29aeC80D2Dfe6C9a317",
        UNIVERSAL_ROUTER: "0xefd1d4bd4cf1e86da286bb4cb1b8bced9c10ba47",
        POSITION_MANAGER: "0xAc631556d3d4019C95769033B5E719dD77124BAc",
        STATE_VIEW: "0x9d467fa9062b6e9b1a46e26007ad82db116c67cb",
        QUOTER: "0x7de51022d70a725b508085468052e25e22b5c4c9",
    },
} as const;

export const TOKEN_LIST = {
    [mainnet.id]: {
        ETH: zeroAddress,
        USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
        PEPE: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
    },
    [bsc.id]: {
        BNB: zeroAddress,
        USDC: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
        SOL: "0x570A5D26f7765Ecb712C0924E4De545B89fD43dF",
    },
    [base.id]: {
        ETH: zeroAddress,
        USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        VVV: "0xacfE6019Ed1A7Dc6f7B508C02d1b04ec88cC21bf",
        VIRTUAL: "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b",
    },
    [1337]: {
        // TokenA: {name: "TokenA", symbol: "A", decimals: 18, address: "0x61e9C0F278A8eF734a0DDA0120268F59e8073d42"},
        // TokenB:{name: "TokenB", symbol: "B", decimals: 18, address: "0x7C40Fa89B2887738563a88da36b60221861C64d6"},
        // TokenC:{name: "TokenC", symbol: "C", decimals: 18, address: "0x30E704A9DcCd40Dd70e2c01b4eb6ac74A6810327"},
        // testUSDC: {name: "testUSDC", symbol: "tUSDC", decimals: 6, address: "0x9CDde7E2B11BAb707B935b1E12b090005B2939F8"},
        TokenA: { name: "TokenA", symbol: "A", decimals: 18, address: "0x6A9996e0aeB928820cFa1a1dB7C62bA61B473280" },
        TokenB: { name: "TokenB", symbol: "B", decimals: 18, address: "0x500a80035829572e8E637dC654AE32bC2560968F" },
        TokenC: { name: "TokenC", symbol: "C", decimals: 18, address: "0xBCe7609fC22e1aC5B256B2316166d3f8788ae69e" },
        MOCK_A: { name: "MockA", symbol: "A", decimals: 18, address: MOCK_A },
        MOCK_B: { name: "MockB", symbol: "B", decimals: 18, address: MOCK_B },
        testUSDC: {
            name: "testUSDC",
            symbol: "tUSDC",
            decimals: 6,
            address: "0x7f3aa3c525A3CDBd09488BDa5e36D68977490c41",
        },
    },
    [1338]: {
        // testUSDC: {name: "testUSDC", symbol: "tUSDC", decimals: 6, address: "0x9CDde7E2B11BAb707B935b1E12b090005B2939F8"},
        testUSDC: {
            name: "testUSDC",
            symbol: "tUSDC",
            decimals: 6,
            address: "0x7f3aa3c525A3CDBd09488BDa5e36D68977490c41",
        },
    },
    [sepolia.id]: {
        TokenA: { name: "TokenA", symbol: "A", decimals: 18, address: "0x6A9996e0aeB928820cFa1a1dB7C62bA61B473280" },
        TokenB: { name: "TokenB", symbol: "B", decimals: 18, address: "0x500a80035829572e8E637dC654AE32bC2560968F" },
        TokenC: { name: "TokenC", symbol: "C", decimals: 18, address: "0xBCe7609fC22e1aC5B256B2316166d3f8788ae69e" },
        testUSDC: {
            name: "testUSDC",
            symbol: "tUSDC",
            decimals: 6,
            address: "0x7f3aa3c525A3CDBd09488BDa5e36D68977490c41",
        },
    },
    [arbitrumSepolia.id]: {
        testUSDC: {
            name: "testUSDC",
            symbol: "tUSDC",
            decimals: 6,
            address: "0x7f3aa3c525A3CDBd09488BDa5e36D68977490c41",
        },
        TokenA: { name: "TokenA", symbol: "A", decimals: 18, address: "0x070b1315bc9fCBD8F784f6556257e7D5c4c11900" },
    },
} as const;

export const MOCK_POOLS = {
    [1337]: {
        currency0:
            TOKEN_LIST[1337].TokenA.address < TOKEN_LIST[1337].testUSDC.address
                ? TOKEN_LIST[1337].TokenA.address
                : TOKEN_LIST[1337].testUSDC.address,
        currency1:
            TOKEN_LIST[1337].TokenA.address < TOKEN_LIST[1337].testUSDC.address
                ? TOKEN_LIST[1337].testUSDC.address
                : TOKEN_LIST[1337].TokenA.address,
        fee: 3000,
        tickSpacing: 60,
        hooks: zeroAddress,
    },
    // [1338]: {
    //     currency0:
    //     TOKEN_LIST[1338].TokenA.address < TOKEN_LIST[1338].testUSDC.address
    //         ? TOKEN_LIST[1338].TokenA.address
    //         : TOKEN_LIST[1338].testUSDC.address,
    // currency1:
    //     TOKEN_LIST[1338].TokenA.address < TOKEN_LIST[1338].testUSDC.address
    //         ? TOKEN_LIST[1338].testUSDC.address
    //         : TOKEN_LIST[1338].TokenA.address,
    //     fee: 3000,
    //     tickSpacing: 60,
    //     hooks: zeroAddress,
    // },
};

// TODO: Fix values
export const testHyperlaneRegistry: HyperlaneRegistry = {
    metadata: {
        "localhost-1337": {
            chainId: 1337,
            name: "localhost-1337",
        } as ChainMetadata,
        "localhost-1338": {
            chainId: 1338,
            name: "localhost-1338",
        } as ChainMetadata,
    } as ChainMap<ChainMetadata>,
    addresses: {
        "localhost-1337": {
            mailbox: "0x8794e76f46289f1F8C433cCe4259C455335346aa",
        },
        "localhost-1338": {
            mailbox: "0x1e8fC27Af09d117Df6B931433e29fCF6463f3a95",
        },
    },
};

// TODO: Fix values
export const tokenBridgeMap: TokenBridgeMap = {
    [1]: {
        "0x0000000000000000000000000000000000000001": {
            bridgeAddress: "0x0000000000000000000000000000000000000001",
            remotes: { [2]: "0x0000000000000000000000000000000000000002" },
        },
    },
    // Token A
    [arbitrumSepolia.id]: {
        "0x070b1315bc9fCBD8F784f6556257e7D5c4c11900": {
            remotes: { [sepolia.id]: "0x6A9996e0aeB928820cFa1a1dB7C62bA61B473280" },
        },
    },
    [sepolia.id]: {
        "0x6A9996e0aeB928820cFa1a1dB7C62bA61B473280": {
            bridgeAddress: "0x2078763224e3C8Fc0cDe40C29a98e8d6b2a540F1",
            remotes: { [arbitrumSepolia.id]: "0x070b1315bc9fCBD8F784f6556257e7D5c4c11900" },
        },
    },
};

export const POOLS: Record<number, PoolKey[]> = {
    [mainnet.id]: [
        // USDC-WBTC
        {
            currency0:
                TOKEN_LIST[mainnet.id].USDT < TOKEN_LIST[mainnet.id].WBTC
                    ? TOKEN_LIST[mainnet.id].USDT
                    : TOKEN_LIST[mainnet.id].WBTC,
            currency1:
                TOKEN_LIST[mainnet.id].USDT < TOKEN_LIST[mainnet.id].WBTC
                    ? TOKEN_LIST[mainnet.id].WBTC
                    : TOKEN_LIST[mainnet.id].USDT,
            fee: 3000,
            tickSpacing: 60,
            hooks: zeroAddress,
        },
        // USDC-PEPE
        {
            currency0:
                TOKEN_LIST[mainnet.id].ETH < TOKEN_LIST[mainnet.id].PEPE
                    ? TOKEN_LIST[mainnet.id].ETH
                    : TOKEN_LIST[mainnet.id].PEPE,
            currency1:
                TOKEN_LIST[mainnet.id].ETH < TOKEN_LIST[mainnet.id].PEPE
                    ? TOKEN_LIST[mainnet.id].PEPE
                    : TOKEN_LIST[mainnet.id].ETH,
            fee: 25000,
            tickSpacing: 500,
            hooks: zeroAddress,
        },
        // WBTC-USDT
        {
            currency0:
                TOKEN_LIST[mainnet.id].WBTC < TOKEN_LIST[mainnet.id].USDT
                    ? TOKEN_LIST[mainnet.id].WBTC
                    : TOKEN_LIST[mainnet.id].USDT,
            currency1:
                TOKEN_LIST[mainnet.id].WBTC < TOKEN_LIST[mainnet.id].USDT
                    ? TOKEN_LIST[mainnet.id].USDT
                    : TOKEN_LIST[mainnet.id].WBTC,
            fee: 3000,
            tickSpacing: 60,
            hooks: zeroAddress,
        },
    ],
    [bsc.id]: [
        // USDC-SOL
        {
            currency0:
                TOKEN_LIST[bsc.id].USDC < TOKEN_LIST[bsc.id].SOL ? TOKEN_LIST[bsc.id].USDC : TOKEN_LIST[bsc.id].SOL,
            currency1:
                TOKEN_LIST[bsc.id].USDC < TOKEN_LIST[bsc.id].SOL ? TOKEN_LIST[bsc.id].SOL : TOKEN_LIST[bsc.id].USDC,
            fee: 3000,
            tickSpacing: 60,
            hooks: zeroAddress,
        },
    ],
    [base.id]: [
        // VIRTUAL-USDC
        {
            currency0:
                TOKEN_LIST[base.id].VIRTUAL < TOKEN_LIST[base.id].USDC
                    ? TOKEN_LIST[base.id].VIRTUAL
                    : TOKEN_LIST[base.id].USDC,
            currency1:
                TOKEN_LIST[base.id].VIRTUAL < TOKEN_LIST[base.id].USDC
                    ? TOKEN_LIST[base.id].USDC
                    : TOKEN_LIST[base.id].VIRTUAL,
            fee: 3000,
            tickSpacing: 60,
            hooks: zeroAddress,
        },
        // USDC-VVV
        {
            currency0:
                TOKEN_LIST[base.id].USDC < TOKEN_LIST[base.id].VVV ? TOKEN_LIST[base.id].USDC : TOKEN_LIST[base.id].VVV,
            currency1:
                TOKEN_LIST[base.id].USDC < TOKEN_LIST[base.id].VVV ? TOKEN_LIST[base.id].VVV : TOKEN_LIST[base.id].USDC,
            fee: 3000,
            tickSpacing: 60,
            hooks: zeroAddress,
        },
    ],
    [sepolia.id]: [
        // TokenA-TokenB
        {
            currency0:
                TOKEN_LIST[sepolia.id].TokenA.address < TOKEN_LIST[sepolia.id].TokenB.address
                    ? TOKEN_LIST[sepolia.id].TokenA.address
                    : TOKEN_LIST[sepolia.id].TokenB.address,
            currency1:
                TOKEN_LIST[sepolia.id].TokenA.address < TOKEN_LIST[sepolia.id].TokenB.address
                    ? TOKEN_LIST[sepolia.id].TokenB.address
                    : TOKEN_LIST[sepolia.id].TokenA.address,
            fee: 3000,
            tickSpacing: 60,
            hooks: zeroAddress,
        },
    ],
} as const;

// Superchains

export const interopDevnet0 = defineChain({
    id: 420120000,
    name: "Interop Devnet 0",
    network: "interop-alpha-0",
    nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ["https://interop-alpha-0.optimism.io"],
        },
        public: {
            http: ["https://interop-alpha-0.optimism.io"],
        },
    },
    blockExplorers: {
        default: { name: "Blockscout", url: "https://optimism-interop-alpha-0.blockscout.com/" },
        routescan: { name: "RouteScan", url: "https://420120000.testnet.routescan.io/" },
    },
    contracts: {
        OptimismPortal: {
            address: "0x7385d89d38ab79984e7c84fab9ce5e6f4815468a",
        },
    },
    testnet: true,
});

export const interopDevnet1 = defineChain({
    id: 420120001,
    name: "Interop Devnet 1",
    network: "interop-alpha-1",
    nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ["https://interop-alpha-1.optimism.io"],
        },
        public: {
            http: ["https://interop-alpha-1.optimism.io"],
        },
    },
    blockExplorers: {
        default: { name: "Blockscout", url: "https://optimism-interop-alpha-1.blockscout.com/" },
        routescan: { name: "RouteScan", url: "https://420120001.testnet.routescan.io/" },
    },
    contracts: {
        OptimismPortal: {
            address: "0x55f5c4653dbcde7d1254f9c690a5d761b315500c",
        },
    },
    testnet: true,
});
