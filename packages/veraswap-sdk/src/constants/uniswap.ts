import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";
import { Address, encodeDeployData, Hash, keccak256, zeroAddress, zeroHash } from "viem";
import { arbitrum, base, baseSepolia, bsc, optimism, optimismSepolia, polygon, sepolia } from "viem/chains";

import { ExecuteSweep } from "../artifacts/ExecuteSweep.js";
import { MetaQuoter } from "../artifacts/MetaQuoter.js";
import { PoolManager } from "../artifacts/PoolManager.js";
import { PositionManager } from "../artifacts/PositionManager.js";
import { StateView } from "../artifacts/StateView.js";
import { UniswapV3Factory } from "../artifacts/UniswapV3Factory.js";
import { UniswapV3Pool } from "../artifacts/UniswapV3Pool.js";
import { UniversalRouter } from "../artifacts/UniversalRouter.js";
import { UnsupportedProtocol } from "../artifacts/UnsupportedProtocol.js";
import { V4MetaQuoter } from "../artifacts/V4MetaQuoter.js";
import { V4Quoter } from "../artifacts/V4Quoter.js";
import { interopDevnet0, interopDevnet1 } from "../chains/interopDevnet.js";
import { opChainA, opChainB, opChainL1 } from "../chains/supersim.js";

export const V4_SWAP = 0x10;

/*** Custom Contracts ***/
export const EXECUTE_SWEEP = getDeployDeterministicAddress({
    bytecode: ExecuteSweep.bytecode,
    salt: zeroHash,
});

/*** Uniswap Constants ***/
export const PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3";
/**
 * Get Uniswap contracts using deterministic deployment
 * @param params deploy params such as owner, fee_rate
 * @returns Uniswap contract addresses
 */
export function getUniswapContracts(params?: { owner?: Address }) {
    const permit2: Address = PERMIT2_ADDRESS;
    // Deployed with vm.rpc setCode when using anvil (supersim has pre-deploy)
    const weth9 = "0x4200000000000000000000000000000000000006";

    // Uniswap V3 Core
    const v3Factory = getDeployDeterministicAddress({
        bytecode: UniswapV3Factory.bytecode,
        salt: zeroHash,
    });
    const v3PoolInitCodeHash = keccak256(UniswapV3Pool.bytecode);

    // Uniswap V4 Core
    const v4PoolManager = getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            abi: PoolManager.abi,
            bytecode: PoolManager.bytecode,
            args: [params?.owner ?? zeroAddress],
        }),
        salt: zeroHash,
    });

    const positionDescriptor = zeroAddress;
    const v4PositionManager = getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            abi: PositionManager.abi,
            bytecode: PositionManager.bytecode,
            args: [v4PoolManager, permit2, 300_000n, positionDescriptor, weth9],
        }),
        salt: zeroHash,
    });
    // Uniswap V4 Periphery
    const v4StateView = getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            abi: StateView.abi,
            bytecode: StateView.bytecode,
            args: [v4PoolManager],
        }),
        salt: zeroHash,
    });
    const v4Quoter = getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            abi: V4Quoter.abi,
            bytecode: V4Quoter.bytecode,
            args: [v4PoolManager],
        }),
        salt: zeroHash,
    });

    const v4MetaQuoter = getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            abi: V4MetaQuoter.abi,
            bytecode: V4MetaQuoter.bytecode,
            args: [v4PoolManager],
        }),
        salt: zeroHash,
    });

    // Universal Router
    const unsupported = getDeployDeterministicAddress({
        bytecode: UnsupportedProtocol.bytecode,
        salt: zeroHash,
    });
    // Universal Router
    const routerParams = {
        permit2,
        weth9,
        v2Factory: unsupported,
        v3Factory,
        pairInitCodeHash: zeroHash,
        poolInitCodeHash: v3PoolInitCodeHash,
        v4PoolManager,
        v3NFTPositionManager: unsupported,
        v4PositionManager,
    } as const;
    const universalRouter = getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            abi: UniversalRouter.abi,
            bytecode: UniversalRouter.bytecode,
            args: [routerParams],
        }),
        salt: zeroHash,
    });
    const metaQuoter = getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            abi: MetaQuoter.abi,
            bytecode: MetaQuoter.bytecode,
            args: [v3Factory, v3PoolInitCodeHash, v4PoolManager, weth9],
        }),
        salt: zeroHash,
    });

    return {
        weth9,
        v3Factory,
        v3PoolInitCodeHash,
        v4PoolManager,
        v4PositionManager,
        v4StateView,
        v4Quoter,
        v4MetaQuoter,
        metaQuoter,
        universalRouter,
    };
}

/** Uniswap contracts for local deployment via CREATE2 & salt = bytes32(0) */
export const LOCAL_UNISWAP_CONTRACTS = getUniswapContracts();

//TODO: Add metaquoter address (compute using poolManager address)
export interface UniswapContracts {
    weth9?: Address;
    v3Factory?: Address;
    v3PoolInitCodeHash?: Hash;
    v4PoolManager: Address;
    v4PositionManager: Address;
    v4StateView: Address;
    v4Quoter: Address;
    v4MetaQuoter: Address;
    metaQuoter?: Address;
    universalRouter: Address;
}

/** Uniswap contracts by chain */
export const UNISWAP_CONTRACTS: Record<number, UniswapContracts | undefined> = {
    [opChainL1.id]: LOCAL_UNISWAP_CONTRACTS,
    [opChainA.id]: LOCAL_UNISWAP_CONTRACTS,
    [opChainB.id]: LOCAL_UNISWAP_CONTRACTS,
    [sepolia.id]: {
        v4PoolManager: "0xE03A1074c86CFeDd5C142C4F04F1a1536e203543",
        v4PositionManager: "0x429ba70129df741B2Ca2a85BC3A2a3328e5c09b4",
        v4StateView: "0xE1Dd9c3fA50EDB962E442f60DfBc432e24537E4C",
        v4Quoter: "0x61B3f2011A92d183C7dbaDBdA940a7555Ccf9227",
        universalRouter: "0x6fc36029136a0c9585306190387597d14f4c80a2",
        v4MetaQuoter: "0x177109CaE87d41fE3c3d2CE7e7cc47D7d436c515",
    },
    [optimismSepolia.id]: {
        v4PoolManager: "0xf7F5aB3DcA35e17dE187b459159BC643853B3c67",
        v4PositionManager: "0x0B32f74f8365d535783949E014B7754047B64e31",
        v4StateView: "0x0e603cb829ced810efc69a037335e7566c192959",
        v4Quoter: "0xBc8E0BE46FFD624c262d63d9393Ac06523B59c3c",
        universalRouter: "0x5fb0c37c53ccf5445ef0bac4eea32da4258d5278",
        v4MetaQuoter: "0xDdB56165FAd0595418479771aec342f57fded1e1",
    },
    [baseSepolia.id]: {
        v4PoolManager: "0xf7F5aB3DcA35e17dE187b459159BC643853B3c67",
        v4PositionManager: "0x0B32f74f8365d535783949E014B7754047B64e31",
        v4StateView: "0x0e603cb829ced810efc69a037335e7566c192959",
        v4Quoter: "0xBc8E0BE46FFD624c262d63d9393Ac06523B59c3c",
        universalRouter: "0x2a229f4f81d0b9a434584d6ebc2ffa9e30b8d82d",
        v4MetaQuoter: "0xDdB56165FAd0595418479771aec342f57fded1e1",
    },
    // TODO: add when uniswap supports
    // [superseed.id]: {
    //     v4PoolManager: "",
    //     v4PositionManager: "",
    //     v4StateView: "",
    //     v4Quoter: "",
    //     universalRouter: "",
    // },
    [interopDevnet0.id]: {
        v4PoolManager: "0x4e8C56BeC0907f8e70E2341fF28fcfD8589E3a2d",
        v4PositionManager: "0xb1163e279741D353540afF310ffAb329fbd78C08",
        v4StateView: "0x0e603cb829ced810efc69a037335e7566c192959",
        v4Quoter: "0x27fCc8497f32B6D046ed433D633535E59Cf02dc7",
        universalRouter: "0x5e654ADc08b75846bCa12a7FB88eD74309776605",
        // TODO: properly deploy again. We get an error code -32000: already known
        v4MetaQuoter: "0x5C6B308959cbc4955af33Dd23Ac5ed6b9fd16664",
    },
    [interopDevnet1.id]: {
        v4PoolManager: "0x4e8C56BeC0907f8e70E2341fF28fcfD8589E3a2d",
        v4PositionManager: "0xb1163e279741D353540afF310ffAb329fbd78C08",
        v4StateView: "0xF3c2E547e8da2052E2fC997ee94d54FbE59a6375",
        v4Quoter: "0x27fCc8497f32B6D046ed433D633535E59Cf02dc7",
        universalRouter: "0x5e654ADc08b75846bCa12a7FB88eD74309776605",
        // TODO: properly deploy again. We get an error code -32000: already known
        v4MetaQuoter: "0x5C6B308959cbc4955af33Dd23Ac5ed6b9fd16664",
    },
    [arbitrum.id]: {
        v4PoolManager: "0x360E68faCcca8cA495c1B759Fd9EEe466db9FB32",
        v4PositionManager: "0xd88F38F930b7952f2DB2432Cb002E7abbF3dD869",
        v4StateView: "0xE751D8E8020B9AD1D2bb2CEd95EFA97fbd2F0A45",
        v4Quoter: "0x6e69C93152cFF1229E247CDB2153341cA39FE189",
        universalRouter: "0x5D188c9e6222DA351770bdf93517dCa70419e60A",
        v4MetaQuoter: "0x55B13561584DCf661f6ab4C6C80a4Be346C47D39",
    },
    [base.id]: {
        v4PoolManager: "0x498581fF718922c3f8e6A244956aF099B2652b2b",
        v4PositionManager: "0x7C5f5A4bBd8fD63184577525326123B519429bDc",
        v4StateView: "0x4DA860C1bA78a330391fE9c1106841389F1aEC01",
        v4Quoter: "0x613DB448fd6980dc84416B95380a8eaeC581DbE1",
        universalRouter: "0xC3A4b98A8a279D0c84492c3C76e33Da812daCC2f",
        v4MetaQuoter: "0x9016fBc773B7309E80C2CF41EBd52EE58CBD4238",
        metaQuoter: "0x8EEF9d75c396e4EeF76EDb51A828805b5BeE8c1A",
    },
    [bsc.id]: {
        v4PoolManager: "0x28e2Ea090877bF75740558f6BFB36A5ffeE9e9dF",
        v4PositionManager: "0x7A4a5c919aE2541AeD11041A1AEeE68f1287f95b",
        v4StateView: "0xD676ec87044B939D152499469889f5fB3a77D1E0",
        v4Quoter: "0xa889Eca9eDfa9d6048055098D1E8d0C5eC9676d8",
        universalRouter: "0x65DF06E79AA756B353c73E8F66c287bfd3d2803B",
        v4MetaQuoter: "0x63A7c63E83d74f4E609d4E15d75fd155A9699C69",
        metaQuoter: "0xab49293ff734f0615dfa67fdb3b4625fca0747e2",
    },
    [optimism.id]: {
        v4PoolManager: "0x9a13F98Cb987694C9F086b1F5eB990EeA8264Ec3",
        v4PositionManager: "0x3C3Ea4B57a46241e54610e5f022E5c45859A1017",
        v4StateView: "0x97337d1C732FC10C809Ac28C6d2D787c8cA2dFC9",
        v4Quoter: "0x4Bf033864D62d35c0513039e3b20995b4D490Cd9",
        universalRouter: "0x0ad4F5c45F4ad1BcB1c0284dFe9bAb22dC08Dccc",
        v4MetaQuoter: "0x7750F8480Ee52a810C12999e4CDAF5694736543a",
    },
    [polygon.id]: {
        v4PoolManager: "0x67366782805870060151383F4BbFF9daB53e5cD6",
        v4PositionManager: "0x1Ec2eBf4F37E7363FDfe3551602425af0B3ceef9",
        v4StateView: "0x425BbF3cF4df231Da3F29555f72dD8F29465E4ee",
        v4Quoter: "0x2829D6f74c1ddaD51e528a270E8e8038AD56b59A",
        universalRouter: "0xFf7a61D953AB7E4e452E31F4FABb752C918B2170",
        v4MetaQuoter: "0x3e0878e6c9ca0xA5C386eb2EaAe433fa925A74Ba19aad4eA8311de",
        metaQuoter: "0x3e0878e6c9ca920b83a8c5d51a7a32ba18cf4449",
    },
} as const;
