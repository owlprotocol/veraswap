import { zeroAddress, zeroHash, encodeDeployData, defineChain, encodeAbiParameters, Address, keccak256 } from "viem";
import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";
import { type ChainMap, type ChainMetadata } from "@hyperlane-xyz/sdk";
import { mainnet, bsc, base, arbitrum, arbitrumSepolia, sepolia, baseSepolia, localhost } from "viem/chains";
import {
    UnsupportedProtocol,
    MockERC20,
    PoolManager,
    PositionManager,
    StateView,
    UniversalRouterApprovedReentrant,
    V4Quoter,
    HypERC20,
    HypERC20Collateral,
    Mailbox,
    NoopIsm,
    PausableHook,
    HypTokenRouterSweep,
} from "./artifacts/index.js";
import { HyperlaneRegistry, PoolKey } from "./types/index.js";
import { TokenBridgeMap } from "./types/TokenBridgeMap.js";
import { unichainSepolia, inkSepolia, localOp, localOpChainA, localOpChainB } from "./chains.js";
import { localhost2 } from "./chains.js";

export const MAX_UINT_256 = 2n ** 256n - 1n;
export const MAX_UINT_160 = 2n ** 160n - 1n;
export const MAX_UINT_48 = 2 ** 48 - 1;
export const V4_SWAP = 0x10;

export const PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3";
export const UNSUPPORTED_PROTOCOL = getDeployDeterministicAddress({
    bytecode: UnsupportedProtocol.bytecode,
    salt: zeroHash,
});

export const DIVVI_BASE_REGISTRY = "0xba9655677f4e42dd289f5b7888170bc0c7da8cdc";

// export const UNIVERSAL_ROUTER = "0x8C29321D10039d36dB8d084009761D79c2707B6d";
// export const POOL_MANAGER = "0x9992a639900866aFDE75D714c8Ef76edA447A18c";
// export const POSITION_MANAGER = "0x9737f068eb64a1328B7A323370DDf836d3a446BD";
// export const QUOTER = "0x8B163bB00AE59d3c1b79F3e63798087C40ea7AE8";
// export const STATE_VIEW = "0x3282543F6117a031a2a2c8Cf535Aebdd0Dde0887";

export const HYPERLANE_NOOP_ISM = getDeployDeterministicAddress({
    bytecode: NoopIsm.bytecode,
    salt: zeroHash,
});
export const HYPERLANE_PAUSABLE_HOOK = getDeployDeterministicAddress({
    bytecode: PausableHook.bytecode,
    salt: zeroHash,
});

export const getMailboxAddress = (chainId: number) =>
    getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            bytecode: Mailbox.bytecode,
            abi: Mailbox.abi,
            args: [chainId],
        }),
        salt: zeroHash,
    });

export const getSyntheticTokenAddress = (
    chainId: number,
    totalSupply: bigint,
    decimals: number,
    name: string,
    symbol: string,
    msgSender: Address = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
) => {
    const mailbox = getMailboxAddress(chainId);

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

export const getCollateralTokenAddress = (chainId: number, tokenAddress: Address) => {
    const mailbox = getMailboxAddress(chainId);

    return getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            bytecode: HypERC20Collateral.bytecode,
            abi: HypERC20Collateral.abi,
            args: [tokenAddress, mailbox],
        }),
        salt: zeroHash,
    });
};

export const POOL_MANAGER = getDeployDeterministicAddress({
    bytecode: encodeDeployData({
        bytecode: PoolManager.bytecode,
        abi: PoolManager.abi,
        args: [zeroAddress],
    }),
    salt: zeroHash,
});
export const POSITION_MANAGER = getDeployDeterministicAddress({
    bytecode: encodeDeployData({
        bytecode: PositionManager.bytecode,
        abi: PositionManager.abi,
        args: [POOL_MANAGER, PERMIT2_ADDRESS, 300_000n, zeroAddress, zeroAddress],
    }),
    salt: zeroHash,
});

export const UNIVERSAL_ROUTER = getDeployDeterministicAddress({
    bytecode: encodeDeployData({
        bytecode: UniversalRouterApprovedReentrant.bytecode,
        abi: UniversalRouterApprovedReentrant.abi,
        args: [
            {
                permit2: PERMIT2_ADDRESS,
                weth9: "0x4200000000000000000000000000000000000006",
                v2Factory: UNSUPPORTED_PROTOCOL,
                v3Factory: UNSUPPORTED_PROTOCOL,
                pairInitCodeHash: zeroHash,
                poolInitCodeHash: zeroHash,
                v4PoolManager: POOL_MANAGER,
                v3NFTPositionManager: UNSUPPORTED_PROTOCOL,
                v4PositionManager: POSITION_MANAGER,
            },
        ],
    }),
    salt: zeroHash,
});

export const QUOTER = getDeployDeterministicAddress({
    bytecode: encodeDeployData({
        bytecode: V4Quoter.bytecode,
        abi: V4Quoter.abi,
        args: [POOL_MANAGER],
    }),
    salt: zeroHash,
});
export const STATE_VIEW = getDeployDeterministicAddress({
    bytecode: encodeDeployData({
        bytecode: StateView.bytecode,
        abi: StateView.abi,
        args: [POOL_MANAGER],
    }),
    salt: zeroHash,
});

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

export const COLLATERAL_TOKEN_A_900 = getCollateralTokenAddress(900, TOKEN_A);
export const COLLATERAL_TOKEN_B_900 = getCollateralTokenAddress(900, TOKEN_B);

export const SYNTH_TOKEN_A_901 = getSyntheticTokenAddress(901, 0n, 18, "Synth Token A", "sA");
export const SYNTH_TOKEN_B_901 = getSyntheticTokenAddress(901, 0n, 18, "Synth Token B", "sB");

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
        POOL_MANAGER: "0x6aa638fe70021cf4a9ce34c2e7718b99d4360efd",
        UNIVERSAL_ROUTER: "0x8c082e9cba8b2f1171ef12a31e02a8fe99f1db43",
        POSITION_MANAGER: "0x97b4242a6cde1437e7c8b3e79f3f2e99cf90899a",
        STATE_VIEW: "0xc3e8977ebab56512e16194ee84a895b15987fb22",
        QUOTER: "0x97a52483ebc89e1e5ef69df01f3f01142e03e192",
    },
    [arbitrumSepolia.id]: {
        POOL_MANAGER: "0xFB3e0C6F74eB1a21CC1Da29aeC80D2Dfe6C9a317",
        UNIVERSAL_ROUTER: "0xefd1d4bd4cf1e86da286bb4cb1b8bced9c10ba47",
        POSITION_MANAGER: "0xAc631556d3d4019C95769033B5E719dD77124BAc",
        STATE_VIEW: "0x9d467fa9062b6e9b1a46e26007ad82db116c67cb",
        QUOTER: "0x7de51022d70a725b508085468052e25e22b5c4c9",
    },
    [interopDevnet0.id]: {
        POOL_MANAGER: "0x6aa638fe70021cf4a9ce34c2e7718b99d4360efd",
        UNIVERSAL_ROUTER: "0x8c082e9cba8b2f1171ef12a31e02a8fe99f1db43",
        POSITION_MANAGER: "0x97b4242a6cde1437e7c8b3e79f3f2e99cf90899a",
        STATE_VIEW: "0xc3e8977ebab56512e16194ee84a895b15987fb22",
        QUOTER: "0x97a52483ebc89e1e5ef69df01f3f01142e03e192",
    },
    [interopDevnet1.id]: {
        POOL_MANAGER: "0x6aa638fe70021cf4a9ce34c2e7718b99d4360efd",
        UNIVERSAL_ROUTER: "0x8c082e9cba8b2f1171ef12a31e02a8fe99f1db43",
        POSITION_MANAGER: "0x97b4242a6cde1437e7c8b3e79f3f2e99cf90899a",
        STATE_VIEW: "0xc3e8977ebab56512e16194ee84a895b15987fb22",
        QUOTER: "0x97a52483ebc89e1e5ef69df01f3f01142e03e192",
    },
    // TODO: FIX
    [baseSepolia.id]: {
        UNSUPPORTED_PROTOCOL,
        POOL_MANAGER,
        POSITION_MANAGER,
        UNIVERSAL_ROUTER,
        QUOTER,
        STATE_VIEW,
    },
    // TODO: FIX
    [unichainSepolia.id]: {
        UNSUPPORTED_PROTOCOL,
        POOL_MANAGER,
        POSITION_MANAGER,
        UNIVERSAL_ROUTER,
        QUOTER,
        STATE_VIEW,
    },
    // TODO: FIX
    [inkSepolia.id]: {
        UNSUPPORTED_PROTOCOL,
        POOL_MANAGER,
        POSITION_MANAGER,
        UNIVERSAL_ROUTER,
        QUOTER,
        STATE_VIEW,
    },
    [localOp.id]: {
        UNSUPPORTED_PROTOCOL,
        POOL_MANAGER,
        POSITION_MANAGER,
        UNIVERSAL_ROUTER,
        QUOTER,
        STATE_VIEW,
    },
    [localOpChainA.id]: {
        UNSUPPORTED_PROTOCOL,
        POOL_MANAGER,
        POSITION_MANAGER,
        UNIVERSAL_ROUTER,
        QUOTER,
        STATE_VIEW,
    },
    [localOpChainB.id]: {
        UNSUPPORTED_PROTOCOL,
        POOL_MANAGER,
        POSITION_MANAGER,
        UNIVERSAL_ROUTER,
        QUOTER,
        STATE_VIEW,
    },
} as const;

// TODO: Derive these from bytecode instead of hard-coding?
// TODO: forge simulation suggests SUPERCHAIN_SWEEP_ADDRESS=0x447311458A14F3890Dbab5Ff1Bca94074214F501?
// Maybe from different forge config in past?
export const SUPERCHAIN_SWEEP_ADDRESS = "0x7eF899a107a9a98002E23910838731562A3e8dC4";
export const SUPERCHAIN_TOKEN_BRIDGE = "0x4200000000000000000000000000000000000028";
export const HYPERLANE_ROUTER_SWEEP_ADDRESS = getDeployDeterministicAddress({
    bytecode: HypTokenRouterSweep.bytecode,
    salt: zeroHash,
});

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
    // 1338
    testUSDC_1338: {
        name: "test USDC",
        symbol: "tUSDC",
        decimals: 6,
        address: "0x7f3aa3c525A3CDBd09488BDa5e36D68977490c41",
        chainId: localhost2.id,
    },
    tokenA_LOCAL_OP: {
        name: "OP Token A",
        symbol: "opA",
        decimals: 18,
        address: TOKEN_A,
        chainId: localOp.id,
    },
    tokenB_LOCAL_OP: {
        name: "OP Token B",
        symbol: "opB",
        decimals: 18,
        address: TOKEN_B,
        chainId: localOp.id,
    },
    synthTokenA_LOCAL_OP_CHAIN_A: {
        name: "Synth Token A",
        symbol: "sA",
        decimals: 18,
        address: SYNTH_TOKEN_A_901,
        chainId: localOpChainA.id,
    },
    synthTokenB_LOCAL_OP_CHAIN_A: {
        name: "Synth Token B",
        symbol: "sB",
        decimals: 18,
        address: SYNTH_TOKEN_B_901,
        chainId: localOpChainA.id,
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

export const MOCK_POOLS = {
    [1337]: {
        currency0:
            TOKEN_LIST.TokenA_1337.address < TOKEN_LIST.testUSDC_1337.address
                ? TOKEN_LIST.TokenA_1337.address
                : TOKEN_LIST.testUSDC_1337.address,
        currency1:
            TOKEN_LIST.TokenA_1337.address < TOKEN_LIST.testUSDC_1337.address
                ? TOKEN_LIST.testUSDC_1337.address
                : TOKEN_LIST.TokenA_1337.address,
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
        "localhost-op": {
            chainId: 900,
            name: "localhost-op",
        } as ChainMetadata,
        "localhost-op-chain-a": {
            chainId: 901,
            name: "localhost-op-chain-a",
        } as ChainMetadata,
        "localhost-op-chain-b": {
            chainId: 902,
            name: "localhost-op-chain-b",
        } as ChainMetadata,
    } as ChainMap<ChainMetadata>,
    addresses: {
        "localhost-1337": {
            mailbox: getMailboxAddress(1337),
        },
        "localhost-1338": {
            mailbox: getMailboxAddress(1338),
        },
        "localhost-op": {
            mailbox: getMailboxAddress(900),
        },
        "localhost-op-chain-a": {
            mailbox: getMailboxAddress(901),
        },
        "localhost-op-chain-b": {
            mailbox: getMailboxAddress(902),
        },
    },
};

// TODO: Fix values
export const tokenBridgeMap: TokenBridgeMap = {
    [arbitrumSepolia.id]: {
        // Token A
        "0x070b1315bc9fCBD8F784f6556257e7D5c4c11900": {
            remotes: { [sepolia.id]: "0x6A9996e0aeB928820cFa1a1dB7C62bA61B473280" },
        },
    },
    [sepolia.id]: {
        // Token A For Arbi
        "0x6A9996e0aeB928820cFa1a1dB7C62bA61B473280": {
            bridgeAddress: "0x2078763224e3C8Fc0cDe40C29a98e8d6b2a540F1",
            remotes: { [arbitrumSepolia.id]: "0x070b1315bc9fCBD8F784f6556257e7D5c4c11900" },
        },
        // Token A
        "0xFA306dFDe7632a6c74bdaBbBB19fA59c7A78D73B": {
            bridgeAddress: "0xE3664722A685de10B27460D9097767813B5E0459",
            remotes: {
                [baseSepolia.id]: "0x05cad57113cb3fa213982dc9553498018c1d08b7",
                [unichainSepolia.id]: "0x274d622afa517251bdf73ea08377b78dd9f49f2b",
                [inkSepolia.id]: "0x274d622afa517251bdf73ea08377b78dd9f49f2b",
            },
        },
        // Token B
        "0xf79509E6faDC7254D59d49Bcd976d5523177ec4f": {
            bridgeAddress: "0x5F2785F8C06fff20F44E7D1c4940694Cd271343b",
            remotes: {
                [baseSepolia.id]: "0x3744d204595af66329b325a7651b005fbdcd77a4",
                [unichainSepolia.id]: "0x5983458d6d58b80257744872a778ece9e82ceec0",
                [inkSepolia.id]: "0x5983458d6d58b80257744872a778ece9e82ceec0",
            },
        },
    },
    [baseSepolia.id]: {
        "0x05cad57113cb3fa213982dc9553498018c1d08b7": {
            remotes: {
                [sepolia.id]: "0xFA306dFDe7632a6c74bdaBbBB19fA59c7A78D73B",
                [unichainSepolia.id]: "0x274d622afa517251bdf73ea08377b78dd9f49f2b",
                [inkSepolia.id]: "0x274d622afa517251bdf73ea08377b78dd9f49f2b",
            },
        },
        "0x3744d204595af66329b325a7651b005fbdcd77a4": {
            remotes: {
                [sepolia.id]: "0xf79509E6faDC7254D59d49Bcd976d5523177ec4f",
                [unichainSepolia.id]: "0x5983458d6d58b80257744872a778ece9e82ceec0",
                [inkSepolia.id]: "0x5983458d6d58b80257744872a778ece9e82ceec0",
            },
        },
    },
    [unichainSepolia.id]: {
        "0x274d622afa517251bdf73ea08377b78dd9f49f2b": {
            remotes: {
                [sepolia.id]: "0xFA306dFDe7632a6c74bdaBbBB19fA59c7A78D73B",
                [baseSepolia.id]: "0x05cad57113cb3fa213982dc9553498018c1d08b7",
                [inkSepolia.id]: "0x274d622afa517251bdf73ea08377b78dd9f49f2b",
            },
        },
        "0x5983458d6d58b80257744872a778ece9e82ceec0": {
            remotes: {
                [sepolia.id]: "0xf79509E6faDC7254D59d49Bcd976d5523177ec4f",
                [baseSepolia.id]: "0x3744d204595af66329b325a7651b005fbdcd77a4",
                [inkSepolia.id]: "0x5983458d6d58b80257744872a778ece9e82ceec0",
            },
        },
    },
    [inkSepolia.id]: {
        "0x274d622afa517251bdf73ea08377b78dd9f49f2b": {
            remotes: {
                [sepolia.id]: "0xFA306dFDe7632a6c74bdaBbBB19fA59c7A78D73B",
                [baseSepolia.id]: "0x05cad57113cb3fa213982dc9553498018c1d08b7",
                [unichainSepolia.id]: "0x274d622afa517251bdf73ea08377b78dd9f49f2b",
            },
        },
        "0x5983458d6d58b80257744872a778ece9e82ceec0": {
            remotes: {
                [sepolia.id]: "0xf79509E6faDC7254D59d49Bcd976d5523177ec4f",
                [baseSepolia.id]: "0x3744d204595af66329b325a7651b005fbdcd77a4",
                [unichainSepolia.id]: "0x5983458d6d58b80257744872a778ece9e82ceec0",
            },
        },
    },
    [localOp.id]: {
        [TOKEN_A]: {
            bridgeAddress: COLLATERAL_TOKEN_A_900,
            remotes: {
                [localOpChainA.id]: SYNTH_TOKEN_A_901,
            },
        },
        [TOKEN_B]: {
            bridgeAddress: COLLATERAL_TOKEN_B_900,
            remotes: {
                [localOpChainA.id]: SYNTH_TOKEN_B_901,
            },
        },
    },
    [localOpChainA.id]: {
        [SYNTH_TOKEN_A_901]: {
            remotes: {
                [localOp.id]: TOKEN_A,
            },
        },
        [SYNTH_TOKEN_B_901]: {
            remotes: {
                [localOp.id]: TOKEN_B,
            },
        },
    },
};

export const POOLS: Record<number, PoolKey[]> = {
    // [mainnet.id]: [
    //     // USDC-WBTC
    //     {
    //         currency0:
    //             TOKEN_LIST[mainnet.id].USDT.address < TOKEN_LIST[mainnet.id].WBTC.address
    //                 ? TOKEN_LIST[mainnet.id].USDT.address
    //                 : TOKEN_LIST[mainnet.id].WBTC.address,
    //         currency1:
    //             TOKEN_LIST[mainnet.id].USDT.address < TOKEN_LIST[mainnet.id].WBTC.address
    //                 ? TOKEN_LIST[mainnet.id].WBTC.address
    //                 : TOKEN_LIST[mainnet.id].USDT.address,
    //         fee: 3000,
    //         tickSpacing: 60,
    //         hooks: zeroAddress,
    //     },
    //     // USDC-PEPE
    //     {
    //         currency0:
    //             TOKEN_LIST[mainnet.id].ETH.address < TOKEN_LIST[mainnet.id].PEPE.address
    //                 ? TOKEN_LIST[mainnet.id].ETH.address
    //                 : TOKEN_LIST[mainnet.id].PEPE.address,
    //         currency1:
    //             TOKEN_LIST[mainnet.id].ETH.address < TOKEN_LIST[mainnet.id].PEPE.address
    //                 ? TOKEN_LIST[mainnet.id].PEPE.address
    //                 : TOKEN_LIST[mainnet.id].ETH.address,
    //         fee: 25000,
    //         tickSpacing: 500,
    //         hooks: zeroAddress,
    //     },
    //     // WBTC-USDT
    //     {
    //         currency0:
    //             TOKEN_LIST[mainnet.id].WBTC.address < TOKEN_LIST[mainnet.id].USDT.address
    //                 ? TOKEN_LIST[mainnet.id].WBTC.address
    //                 : TOKEN_LIST[mainnet.id].USDT.address,
    //         currency1:
    //             TOKEN_LIST[mainnet.id].WBTC.address < TOKEN_LIST[mainnet.id].USDT.address
    //                 ? TOKEN_LIST[mainnet.id].USDT.address
    //                 : TOKEN_LIST[mainnet.id].WBTC.address,
    //         fee: 3000,
    //         tickSpacing: 60,
    //         hooks: zeroAddress,
    //     },
    // ],
    // [bsc.id]: [
    //     // USDC-SOL
    //     {
    //         currency0:
    //             TOKEN_LIST[bsc.id].USDC.address < TOKEN_LIST[bsc.id].SOL.address
    //                 ? TOKEN_LIST[bsc.id].USDC.address
    //                 : TOKEN_LIST[bsc.id].SOL.address,
    //         currency1:
    //             TOKEN_LIST[bsc.id].USDC.address < TOKEN_LIST[bsc.id].SOL.address
    //                 ? TOKEN_LIST[bsc.id].SOL.address
    //                 : TOKEN_LIST[bsc.id].USDC.address,
    //         fee: 3000,
    //         tickSpacing: 60,
    //         hooks: zeroAddress,
    //     },
    // ],
    [base.id]: [
        // VIRTUAL-USDC
        {
            currency0:
                TOKEN_LIST.VIRTUAL_BASE.address < TOKEN_LIST.USDC_BASE.address
                    ? TOKEN_LIST.VIRTUAL_BASE.address
                    : TOKEN_LIST.USDC_BASE.address,
            currency1:
                TOKEN_LIST.VIRTUAL_BASE.address < TOKEN_LIST.USDC_BASE.address
                    ? TOKEN_LIST.USDC_BASE.address
                    : TOKEN_LIST.VIRTUAL_BASE.address,
            fee: 3000,
            tickSpacing: 60,
            hooks: zeroAddress,
        },
    ],

    //     // USDC-VVV
    //     {
    //         currency0:
    //             TOKEN_LIST[base.id].USDC.address < TOKEN_LIST[base.id].VVV.address
    //                 ? TOKEN_LIST[base.id].USDC.address
    //                 : TOKEN_LIST[base.id].VVV.address,
    //         currency1:
    //             TOKEN_LIST[base.id].USDC.address < TOKEN_LIST[base.id].VVV.address
    //                 ? TOKEN_LIST[base.id].VVV.address
    //                 : TOKEN_LIST[base.id].USDC.address,
    //         fee: 3000,
    //         tickSpacing: 60,
    //         hooks: zeroAddress,
    //     },
    // ],
    [sepolia.id]: [
        // TokenA-TokenB
        {
            currency0:
                TOKEN_LIST.TokenA_SEPOLIA.address < TOKEN_LIST.TokenB_SEPOLIA.address
                    ? TOKEN_LIST.TokenA_SEPOLIA.address
                    : TOKEN_LIST.TokenB_SEPOLIA.address,
            currency1:
                TOKEN_LIST.TokenA_SEPOLIA.address < TOKEN_LIST.TokenB_SEPOLIA.address
                    ? TOKEN_LIST.TokenB_SEPOLIA.address
                    : TOKEN_LIST.TokenA_SEPOLIA.address,
            fee: 3000,
            tickSpacing: 60,
            hooks: zeroAddress,
        },
    ],
} as const;
