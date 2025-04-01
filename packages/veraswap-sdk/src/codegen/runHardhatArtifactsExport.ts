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
    // Uniswap
    "out/IPositionManager.sol/*.json",
    "out/IPoolManager.sol/*.json",
    "out/UnsupportedProtocol.sol/*.json",
    "out/PoolManager.sol/*.json",
    "out/PositionManager.sol/*.json",
    "out/IUniversalRouter.sol/*.json",
    "out/UniversalRouter.sol/*.json",
    "out/IV4Quoter.sol/*.json",
    "out/V4Quoter.sol/*.json",
    "out/IStateView.sol/*.json",
    "out/StateView.sol/*.json",
    // Hyperlane
    "out/HypERC20.sol/*.json",
    "out/HypERC20Collateral.sol/*.json",
    "out/Mailbox.sol/*.json",
    "out/MockMailbox.sol/*.json",
    "out/NoopIsm.sol/*.json",
    "out/PausableHook.sol/*.json",
    // Hyperlane (custom)
    "out/HypERC20FlashCollateral.sol/*.json",
    "out/HypTokenRouterSweep.sol/*.json",
    "out/ERC7579ExecutorRouter.sol/*.json",
    // Superchain
    "out/IL2ToL2CrossDomainMessenger.sol/*.json",
    // Superchain (custom)
    "out/SuperchainTokenBridgeSweep.sol/*.json",
    // Kernel
    "out/Kernel.sol/*.json",
    "out/KernelFactory.sol/*.json",
    "out/ECDSAValidator.sol/*.json",
    // Kernel (custom)
    "out/OwnableSignatureExecutor.sol/*.json",
]);
