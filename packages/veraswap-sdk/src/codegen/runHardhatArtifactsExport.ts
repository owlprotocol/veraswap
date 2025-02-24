import { hardhatArtifactsExport } from "@owlprotocol/viem-utils/codegen";

hardhatArtifactsExport("./src/artifacts", "./cache", [
    "out/IMulticall_v4.sol/*.json",
    "out/MockERC20.sol/*.json",
    "out/IAllowanceTransfer.sol/*.json",
    "out/ISignatureTransfer.sol/*.json",
    "out/IPositionManager.sol/*.json",
    "out/IPoolManager.sol/*.json",
    "out/PoolManager.sol/*.json",
    "out/IUniversalRouter.sol/*.json",
    "out/UniversalRouter.sol/*.json",
    "out/IV4Quoter.sol/*.json",
    "out/V4Quoter.sol/*.json",
    "out/IStateView.sol/*.json",
    "out/StateView.sol/*.json",
    "out/IPermit2.sol/*.json",
]);
