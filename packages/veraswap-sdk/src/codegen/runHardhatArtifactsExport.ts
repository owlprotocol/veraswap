import { hardhatArtifactsExport } from "@veraswap/artifacts-export";

hardhatArtifactsExport("./src/artifacts", "./cache", [
    // Utils
    "out/IMulticall_v4.sol/*.json",
    "out/MockERC20.sol/*.json",
    "out/IERC20.sol/*.json",
    // Permit2
    "out/IAllowanceTransfer.sol/*.json",
    "out/ISignatureTransfer.sol/*.json",
    "out/IPermit2.sol/*.json",
    // WETH
    "out/IWETH9.sol/*.json",
    "out/WETH.sol/*.json",
    // Uniswap V3
    "out/IUniswapV3Factory.sol/*.json",
    "out/UniswapV3Factory.sol/*.json",
    "out/IUniswapV3Pool.sol/*.json",
    "out/UniswapV3Pool.sol/*.json",
    // Uniswap V4
    "out/IPositionManager.sol/*.json",
    "out/IPoolManager.sol/*.json",
    "out/PoolManager.sol/*.json",
    "out/PositionManager.sol/*.json",
    // Uniswap V4 Periphery
    "out/IV4Quoter.sol/*.json",
    "out/V4Quoter.sol/*.json",
    "out/IStateView.sol/*.json",
    "out/StateView.sol/*.json",
    "out/IV4MetaQuoter.sol/*.json",
    "out/V4MetaQuoter.sol/*.json",
    // Universal Router
    "out/UnsupportedProtocol.sol/*.json",
    "out/IUniversalRouter.sol/*.json",
    "out/UniversalRouter.sol/*.json",
    "out/MetaQuoter.sol/*.json",
    // Hyperlane
    "out/HypERC20.sol/*.json",
    "out/HypERC20Collateral.sol/*.json",
    "out/Mailbox.sol/*.json",
    "out/MockMailbox.sol/*.json",
    "out/NoopIsm.sol/*.json",
    "out/PausableHook.sol/*.json",
    "out/GasRouter.sol/*.json",
    // Hyperlane (custom)
    "out/HypERC20FlashCollateral.sol/*.json",
    "out/HypTokenRouterSweep.sol/*.json",
    "out/ERC7579ExecutorRouter.sol/*.json",
    "out/MockInterchainGasPaymaster.sol/*.json",
    "out/IInterchainGasPaymaster.sol/*.json",
    "out/InterchainGasPaymaster.sol/*.json",
    // Superchain
    "out/IL2ToL2CrossDomainMessenger.sol/*.json",
    // Superchain (custom)
    "out/ISuperchainTokenBridge.sol/*.json",
    "out/SuperchainTokenBridgeSweep.sol/*.json",
    "out/MockSuperchainERC20.sol/*.json",
    // Orbiter (custom)
    "out/OrbiterBridgeSweep.sol/*.json",
    // Kernel
    "out/Kernel.sol/*.json",
    "out/KernelFactory.sol/*.json",
    "out/ECDSAValidator.sol/*.json",
    // Kernel (custom)
    "out/OwnableSignatureExecutor.sol/*.json",
    "out/Execute.sol/*.json",
    // Account Abstraction
    "out/SimpleAccountFactory.sol/*.json",
    "out/IEntryPoint.sol/*.json",
    "out/EntryPoint.sol/*.json",
    "out/OpenPaymaster.sol/*.json",
    "out/BalanceDeltaPaymaster.sol/*.json",
    // Baskets (custom)
    "out/BasketFixedUnits.sol/*.json",
    "out/ExecuteSweep.sol/*.json",
]);
