// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/console2.sol";
import "forge-std/Script.sol";
import "forge-std/Test.sol";

import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";

import {RouterParameters} from "@uniswap/universal-router/contracts/types/RouterParameters.sol";
import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {UnsupportedProtocol} from "@uniswap/universal-router/contracts/deploy/UnsupportedProtocol.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolManager} from "@uniswap/v4-core/src/PoolManager.sol";
import {PositionManager} from "@uniswap/v4-periphery/src/PositionManager.sol";
import {IPositionDescriptor} from "@uniswap/v4-periphery/src/interfaces/IPositionDescriptor.sol";
import {IWETH9} from "@uniswap/v4-periphery/src/interfaces/external/IWETH9.sol";

import {IV4Quoter} from "@uniswap/v4-periphery/src/interfaces/IV4Quoter.sol";
import {V4Quoter} from "@uniswap/universal-router/lib/v4-periphery/src/lens/V4Quoter.sol";

import {IStateView} from "@uniswap/v4-periphery/src/interfaces/IStateView.sol";
import {StateView} from "@uniswap/universal-router/lib/v4-periphery/src/lens/StateView.sol";
import {IUniversalRouter} from "@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol";

import {IAllowanceTransfer} from "permit2/src/interfaces/IAllowanceTransfer.sol";

import {Mailbox} from "@hyperlane-xyz/core/Mailbox.sol";
import {NoopIsm} from "@hyperlane-xyz/core/isms/NoopIsm.sol";
import {PausableHook} from "@hyperlane-xyz/core/hooks/PausableHook.sol";

import {DeployPermit2} from "../test/utils/forks/DeployPermit2.sol";
import {DeployParameters, HyperlaneParameters} from "./DeployParameters.s.sol";
import {DeployRouter} from "./DeployRouter.s.sol";

import {HypERC20FlashCollateral} from "../contracts/token/HypERC20FlashCollateral.sol";
import {MockSuperchainERC20} from "../test/MockSuperchainERC20.sol";

struct HyperlaneParameters {
    address mailbox;
}

/// @notice Shared Deploy Parameters
abstract contract DeployParameters is Script, Test, DeployPermit2 {
    RouterParameters internal params;

    IUniversalRouter internal router;
    IV4Quoter internal v4Quoter;
    IStateView internal v4StateView;

    MockERC20[] tokens;
    HypERC20FlashCollateral[] tokenCollaterals;
    MockSuperchainERC20[] tokensSuper;

    HyperlaneParameters internal hyperlaneParams;
    address internal unsupported;

    address constant UNSUPPORTED_PROTOCOL = address(0);
    bytes32 constant BYTES32_ZERO = bytes32(0);
    bytes constant ZERO_BYTES = new bytes(0);
    address DETERMINISTIC_DEPLOYER = 0x4e59b44847b379578588920cA78FbF26c0B4956C;

    error Permit2NotDeployed();

    function setUp() public virtual;

    function logParams() internal view {
        console2.log("***** UNISWAP PARAMS *****");
        console2.log("permit2:", params.permit2);
        console2.log("weth9:", params.weth9);
        console2.log("v2Factory:", params.v2Factory);
        console2.log("v3Factory:", params.v3Factory);
        console2.log("v4PoolManager:", params.v4PoolManager);
        console2.log("v3NFTPositionManager:", params.v3NFTPositionManager);
        console2.log("v4PositionManager:", params.v4PositionManager);
        console2.log("v4Quoter:", address(v4Quoter));

        console2.log("***** HYPERLANE PARAMS *****");
        console2.log("mailbox:", hyperlaneParams.mailbox);
    }

    function logDeployments() internal view {
        console2.log("***** DEPLOYMENTS *****");
        console2.log("UniswapRouter:", address(router));
        console2.log("Tokens");
        for (uint256 i; i < tokens.length; i++) {
            console2.log("token:", address(tokens[i]));
            console2.log("collateral:", address(tokenCollaterals[i]));
        }
    }

    function mapUnsupported(address protocol) internal view returns (address) {
        return protocol == address(0) ? unsupported : protocol;
    }

    function deployCoreContracts() internal {
        // Unsupported
        unsupported = Create2.computeAddress(
            BYTES32_ZERO,
            keccak256(type(UnsupportedProtocol).creationCode),
            DETERMINISTIC_DEPLOYER
        );
        if (unsupported.code.length == 0) {
            address deployed = address(new UnsupportedProtocol{salt: BYTES32_ZERO}());
            assertEq(deployed, unsupported);
        }

        // V4 Pool Manager
        address v4PoolManager = Create2.computeAddress(
            BYTES32_ZERO,
            keccak256(abi.encodePacked(type(PoolManager).creationCode, abi.encode(address(0)))),
            DETERMINISTIC_DEPLOYER
        );
        if (v4PoolManager.code.length == 0) {
            address deployed = address(new PoolManager{salt: BYTES32_ZERO}(address(0)));
            assertEq(deployed, v4PoolManager);
        }

        // V4 Position Manager
        // TODO: Add Position Descriptor, WETH9 deploy
        address v4PositionManager = Create2.computeAddress(
            BYTES32_ZERO,
            keccak256(
                abi.encodePacked(
                    type(PositionManager).creationCode,
                    abi.encode(v4PoolManager, permit2, uint256(300_000), address(0), address(0))
                )
            ),
            DETERMINISTIC_DEPLOYER
        );
        if (v4PositionManager.code.length == 0) {
            address deployed = address(
                new PositionManager{salt: BYTES32_ZERO}(
                    IPoolManager(v4PoolManager),
                    IAllowanceTransfer(permit2),
                    300_000,
                    IPositionDescriptor(address(0)),
                    IWETH9(address(0))
                )
            );
            assertEq(v4PositionManager, deployed);
        }
        params = RouterParameters({
            permit2: address(permit2),
            weth9: mapUnsupported(params.weth9),
            v2Factory: mapUnsupported(params.v2Factory),
            v3Factory: mapUnsupported(params.v3Factory),
            pairInitCodeHash: params.pairInitCodeHash,
            poolInitCodeHash: params.poolInitCodeHash,
            v4PoolManager: address(v4PoolManager),
            v3NFTPositionManager: mapUnsupported(params.v3NFTPositionManager),
            v4PositionManager: address(v4PositionManager)
        });

        // V4 Quoter
        v4Quoter = IV4Quoter(
            Create2.computeAddress(
                BYTES32_ZERO,
                keccak256(abi.encodePacked(type(V4Quoter).creationCode, abi.encode(v4PoolManager))),
                DETERMINISTIC_DEPLOYER
            )
        );
        if (address(v4Quoter).code.length == 0) {
            address deployed = address(new V4Quoter{salt: BYTES32_ZERO}(IPoolManager(v4PoolManager)));
            assertEq(address(v4Quoter), deployed);
        }

        // V4 State View
        v4StateView = IStateView(
            Create2.computeAddress(
                BYTES32_ZERO,
                keccak256(abi.encodePacked(type(StateView).creationCode, abi.encode(v4PoolManager))),
                DETERMINISTIC_DEPLOYER
            )
        );
        if (address(v4StateView).code.length == 0) {
            address deployed = address(new StateView{salt: BYTES32_ZERO}(IPoolManager(v4PoolManager)));
            assertEq(address(v4StateView), deployed);
        }

        // Router Params
        params = RouterParameters({
            permit2: address(permit2),
            //TODO: Add WETH9
            weth9: 0x4200000000000000000000000000000000000006,
            v2Factory: UNSUPPORTED_PROTOCOL,
            v3Factory: UNSUPPORTED_PROTOCOL,
            pairInitCodeHash: BYTES32_ZERO,
            poolInitCodeHash: BYTES32_ZERO,
            v4PoolManager: v4PoolManager,
            v3NFTPositionManager: UNSUPPORTED_PROTOCOL,
            v4PositionManager: v4PositionManager
        });

        // Hyperlane
        address ism = Create2.computeAddress(
            BYTES32_ZERO,
            keccak256(abi.encodePacked(type(NoopIsm).creationCode)),
            DETERMINISTIC_DEPLOYER
        );
        if (ism.code.length == 0) {
            address deployed = address(new NoopIsm{salt: BYTES32_ZERO}());
            assertEq(deployed, ism);
        }
        address hook = Create2.computeAddress(
            BYTES32_ZERO,
            keccak256(abi.encodePacked(type(PausableHook).creationCode)),
            DETERMINISTIC_DEPLOYER
        );
        if (hook.code.length == 0) {
            address deployed = address(new PausableHook{salt: BYTES32_ZERO}());
            assertEq(deployed, hook);
        }
        address mailbox = Create2.computeAddress(
            BYTES32_ZERO,
            keccak256(abi.encodePacked(type(Mailbox).creationCode, abi.encode(uint32(block.chainid)))),
            DETERMINISTIC_DEPLOYER
        );
        if (mailbox.code.length == 0) {
            address deployed = address(new Mailbox{salt: BYTES32_ZERO}(uint32(block.chainid)));
            assertEq(deployed, mailbox);
            Mailbox(mailbox).initialize(msg.sender, address(ism), address(hook), address(hook));
        }

        hyperlaneParams = HyperlaneParameters({mailbox: mailbox});
    }
}
