import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";
import { Address, encodeDeployData, Hash, keccak256, zeroAddress, zeroHash } from "viem";
import {
    arbitrum,
    avalanche,
    base,
    baseSepolia,
    bsc,
    mainnet,
    optimism,
    optimismSepolia,
    polygon,
    sepolia,
    unichainSepolia,
} from "viem/chains";

import { ExecuteSweep } from "../artifacts/ExecuteSweep.js";
import { MetaQuoter } from "../artifacts/MetaQuoter.js";
import { PoolManager } from "../artifacts/PoolManager.js";
import { PositionManager } from "../artifacts/PositionManager.js";
import { StateView } from "../artifacts/StateView.js";
import { UniswapV2Factory } from "../artifacts/UniswapV2Factory.js";
import { UniswapV2Pair } from "../artifacts/UniswapV2Pair.js";
import { UniswapV3Factory } from "../artifacts/UniswapV3Factory.js";
import { UniswapV3Pool } from "../artifacts/UniswapV3Pool.js";
import { UniversalRouter } from "../artifacts/UniversalRouter.js";
import { UnsupportedProtocol } from "../artifacts/UnsupportedProtocol.js";
import { V4Quoter } from "../artifacts/V4Quoter.js";
import { WETH } from "../artifacts/WETH.js";
import { appchainTestnet } from "../chains/appchainTestnet.js";
import { rariTestnet } from "../chains/rariTestnet.js";
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
    // TODO: Deployed with vm.rpc setCode when using anvil (supersim has pre-deploy)
    const weth9 = getDeployDeterministicAddress({
        bytecode: WETH.bytecode,
        salt: zeroHash,
    });

    // Uniswap V2 Core
    const v2Factory = getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            abi: UniswapV2Factory.abi,
            bytecode: UniswapV2Factory.bytecode,
            args: [zeroAddress],
        }),
        salt: zeroHash,
    });
    const v2PairInitCodeHash = keccak256(UniswapV2Pair.bytecode);

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

    // Universal Router
    const unsupported = getDeployDeterministicAddress({
        bytecode: UnsupportedProtocol.bytecode,
        salt: zeroHash,
    });
    // Universal Router
    const routerParams = {
        permit2,
        weth9,
        v2Factory,
        v3Factory,
        pairInitCodeHash: v2PairInitCodeHash,
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
            args: [v2Factory, v2PairInitCodeHash, v3Factory, v3PoolInitCodeHash, v4PoolManager, weth9],
        }),
        salt: zeroHash,
    });

    return {
        weth9,
        v2Factory,
        v2PairInitCodeHash,
        v3Factory,
        v3PoolInitCodeHash,
        v4PoolManager,
        v4PositionManager,
        v4StateView,
        v4Quoter,
        metaQuoter,
        universalRouter,
    };
}

/** Uniswap contracts for local deployment via CREATE2 & salt = bytes32(0) */
export const LOCAL_UNISWAP_CONTRACTS = getUniswapContracts();

export interface UniswapContracts {
    weth9: Address;
    v2Factory?: Address;
    v2PairInitCodeHash?: Hash;
    v3Factory?: Address;
    v3PoolInitCodeHash?: Hash;
    v4PoolManager: Address;
    v4PositionManager: Address;
    v4StateView: Address;
    v4Quoter: Address;
    metaQuoter: Address;
    universalRouter: Address;
}

/** Uniswap contracts by chain */
export const UNISWAP_CONTRACTS: Record<number, UniswapContracts | undefined> = {
    [opChainL1.id]: LOCAL_UNISWAP_CONTRACTS,
    [opChainA.id]: LOCAL_UNISWAP_CONTRACTS,
    [opChainB.id]: LOCAL_UNISWAP_CONTRACTS,
    [sepolia.id]: {
        weth9: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
        v4PoolManager: "0xE03A1074c86CFeDd5C142C4F04F1a1536e203543",
        v4PositionManager: "0x429ba70129df741B2Ca2a85BC3A2a3328e5c09b4",
        v4StateView: "0xE1Dd9c3fA50EDB962E442f60DfBc432e24537E4C",
        v4Quoter: "0x61B3f2011A92d183C7dbaDBdA940a7555Ccf9227",
        universalRouter: "0xca98551440308f7748C782912A0f03f0eD5b9844",
        metaQuoter: "0x67f8b206AA266cFBd2571BC037c2b75a497eFb56",
    },
    [optimismSepolia.id]: {
        weth9: "0x4200000000000000000000000000000000000006",
        v4PoolManager: "0xf7F5aB3DcA35e17dE187b459159BC643853B3c67",
        v4PositionManager: "0x0B32f74f8365d535783949E014B7754047B64e31",
        v4StateView: "0x0e603cb829ced810efc69a037335e7566c192959",
        v4Quoter: "0xBc8E0BE46FFD624c262d63d9393Ac06523B59c3c",
        universalRouter: "0xDB85B92E2dED51920A642b7BA4A3792bC9d7D9e2",
        metaQuoter: "0x18757a64C39abF30073A8789B738e214d402c862",
    },
    [baseSepolia.id]: {
        weth9: "0x4200000000000000000000000000000000000006",
        v4PoolManager: "0xf7F5aB3DcA35e17dE187b459159BC643853B3c67",
        v4PositionManager: "0x0B32f74f8365d535783949E014B7754047B64e31",
        v4StateView: "0x0e603cb829ced810efc69a037335e7566c192959",
        v4Quoter: "0xBc8E0BE46FFD624c262d63d9393Ac06523B59c3c",
        universalRouter: "0x02930376925BaD95a92b2652C7aaAdd7f00eC553",
        metaQuoter: "0xB2E4AfE0A98648BF15FAa641Dbf39b4330ea64A4",
    },
    [unichainSepolia.id]: {
        weth9: "0x4200000000000000000000000000000000000006",
        v4PoolManager: "0x9cB26A7183B2F4515945Dc52CB4195B0d2D06C95",
        v4PositionManager: "0x12A98709BB5D0641D61458f85dcAFbE17AC2d05c",
        v4StateView: "0x33a83982A83C88696760c15f1B7192B263ccB2CB",
        v4Quoter: "0x76963d6C00C3920B292459D98A49e7A2748B2243",
        universalRouter: "0xD22Ec5C594755E0dd00488E2CcbBD1DA4c9Cc7b5",
        metaQuoter: "0x10c05037D5EA03ABcDCfF75da01274a57802C92F",
    },
    [arbitrum.id]: {
        weth9: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
        v4PoolManager: "0x360E68faCcca8cA495c1B759Fd9EEe466db9FB32",
        v4PositionManager: "0xd88F38F930b7952f2DB2432Cb002E7abbF3dD869",
        v4StateView: "0xE751D8E8020B9AD1D2bb2CEd95EFA97fbd2F0A45",
        v4Quoter: "0x6e69C93152cFF1229E247CDB2153341cA39FE189",
        universalRouter: "0xffbc158420E3B0f06C81b2e2620C8d799C79E195",
        metaQuoter: "0x35282e02E79c1B9a9e1868BD036b0f59F66E1dB5",
    },
    [base.id]: {
        weth9: "0x4200000000000000000000000000000000000006",
        v4PoolManager: "0x498581fF718922c3f8e6A244956aF099B2652b2b",
        v4PositionManager: "0x7C5f5A4bBd8fD63184577525326123B519429bDc",
        v4StateView: "0x4DA860C1bA78a330391fE9c1106841389F1aEC01",
        v4Quoter: "0x613DB448fd6980dc84416B95380a8eaeC581DbE1",
        universalRouter: "0x440Edd811C081Dc1a2661e2811Ee10dFf82D7202",
        metaQuoter: "0x5A3eab693473e7c9428B369166D99646c02BF15d",
    },
    [bsc.id]: {
        weth9: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        v4PoolManager: "0x28e2Ea090877bF75740558f6BFB36A5ffeE9e9dF",
        v4PositionManager: "0x7A4a5c919aE2541AeD11041A1AEeE68f1287f95b",
        v4StateView: "0xD676ec87044B939D152499469889f5fB3a77D1E0",
        v4Quoter: "0xa889Eca9eDfa9d6048055098D1E8d0C5eC9676d8",
        universalRouter: "0x740C9926fcB491E092B05Df1d065aA8521D283d4",
        metaQuoter: "0xC4A74061393F6C8eAC741d7b58048Ab37C240be4",
    },
    [optimism.id]: {
        weth9: "0x4200000000000000000000000000000000000006",
        v4PoolManager: "0x9a13F98Cb987694C9F086b1F5eB990EeA8264Ec3",
        v4PositionManager: "0x3C3Ea4B57a46241e54610e5f022E5c45859A1017",
        v4StateView: "0x97337d1C732FC10C809Ac28C6d2D787c8cA2dFC9",
        v4Quoter: "0x4Bf033864D62d35c0513039e3b20995b4D490Cd9",
        universalRouter: "0xeC695984375CFfF23db4AEd38A9030087C2f0C16",
        metaQuoter: "0x190c54d59411b824254333Cac660c5D542ad935f",
    },
    [polygon.id]: {
        weth9: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        v4PoolManager: "0x67366782805870060151383F4BbFF9daB53e5cD6",
        v4PositionManager: "0x1Ec2eBf4F37E7363FDfe3551602425af0B3ceef9",
        v4StateView: "0x425BbF3cF4df231Da3F29555f72dD8F29465E4ee",
        v4Quoter: "0x2829D6f74c1ddaD51e528a270E8e8038AD56b59A",
        universalRouter: "0x4A8b399B1ad2b96Bb86E194B3f647BA6097eEB63",
        metaQuoter: "0x3F66162deD98f81A0551FD18E0755c490ab5E68f",
    },
    [mainnet.id]: {
        weth9: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        v4PoolManager: "0x000000000004444c5dc75cB358380D2e3dE08A90",
        v4PositionManager: "0xbD216513d74C8cf14cf4747E6AaA6420FF64ee9e",
        v4StateView: "0x120842A525a265CbE16338a95F764aBE9dfb7062",
        v4Quoter: "0x45162DBf810A287dF026B53e39125DEEA9221C51",
        metaQuoter: "0xA5Cd4AdC77b140443448841172dDD307D7c420D8",
        universalRouter: "0xFd654dCDf12BF1730488cC1eA9c28Bdf600d0a77",
    },
    [avalanche.id]: {
        weth9: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
        v4PoolManager: "0x06380C0e0912312B5150364B9DC4542BA0DbBc85",
        v4PositionManager: "0xB74b1F14d2754AcfcbBe1a221023a5cf50Ab8ACD",
        v4StateView: "0x79E4E3F08f8646aD38d4184098ac78CD3453A906",
        v4Quoter: "0x4BCb913C9b582b93E5D2f2F7885A05592AEf7ADa",
        metaQuoter: "0xFC1Fa23A71F590D63eE900a843ea9E3f046D26EA",
        universalRouter: "0xC79A372477B4D5b0313F84f87651c168F4C4e3EA",
    },
    [rariTestnet.id]: {
        weth9: "0xe73288389c6caC87aa14E9B35e8e2b3be7fB06C3",
        v4PoolManager: "0x4e8C56BeC0907f8e70E2341fF28fcfD8589E3a2d",
        v4PositionManager: "0x63D91b09DD0e27C672228E52bCF4Ec08E694c0cB",
        v4StateView: "0x7c153E584a32f539556018483605Ed51b18740b7",
        v4Quoter: "0x41566F0a123a64bb14537F56868D60a3CdbCa184",
        metaQuoter: "0xD3E2e6185F42Be570278762aBb90d4df291A5614",
        universalRouter: "0xC632F273A43F013d194f45fAeD8677FA8594d1C5",
    },
    [appchainTestnet.id]: {
        weth9: "0xe73288389c6caC87aa14E9B35e8e2b3be7fB06C3",
        v4PoolManager: "0x4e8C56BeC0907f8e70E2341fF28fcfD8589E3a2d",
        v4PositionManager: "0x63D91b09DD0e27C672228E52bCF4Ec08E694c0cB",
        v4StateView: "0x7c153E584a32f539556018483605Ed51b18740b7",
        v4Quoter: "0x41566F0a123a64bb14537F56868D60a3CdbCa184",
        metaQuoter: "0xD3E2e6185F42Be570278762aBb90d4df291A5614",
        universalRouter: "0xC632F273A43F013d194f45fAeD8677FA8594d1C5",
    },
} as const;
