// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

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

import {IAllowanceTransfer} from "permit2/src/interfaces/IAllowanceTransfer.sol";

import {Mailbox} from "@hyperlane-xyz/core/Mailbox.sol";
import {NoopIsm} from "@hyperlane-xyz/core/isms/NoopIsm.sol";
import {PausableHook} from "@hyperlane-xyz/core/hooks/PausableHook.sol";

import {DeployPermit2} from "../../test/utils/forks/DeployPermit2.sol";
import {DeployParameters, HyperlaneParameters} from "../DeployParameters.s.sol";
import {DeployRouter} from "../DeployRouter.s.sol";

contract DeployAnvil is DeployParameters, DeployPermit2, DeployRouter {
    function setUp() public override {
        address permit2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;

        if (permit2.code.length == 0) {
            deployPermit2();
        }

        // Unsupported
        address unsupported = Create2.computeAddress(BYTES32_ZERO, keccak256(type(UnsupportedProtocol).creationCode));
        if (unsupported.code.length == 0) {
            address deployed = address(new UnsupportedProtocol{salt: BYTES32_ZERO}());
            assertEq(deployed, unsupported);
        }

        // V4 Pool Manager
        address v4PoolManager = Create2.computeAddress(
            BYTES32_ZERO,
            keccak256(abi.encodePacked(type(PoolManager).creationCode, abi.encode(address(0))))
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
            )
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

        // V4 Quoter
        v4Quoter = IV4Quoter(
            Create2.computeAddress(
                BYTES32_ZERO,
                keccak256(abi.encodePacked(type(V4Quoter).creationCode, abi.encode(v4PoolManager)))
            )
        );
        if (address(v4Quoter).code.length == 0) {
            address deployed = address(new V4Quoter{salt: BYTES32_ZERO}(IPoolManager(v4PoolManager)));
            assertEq(v4Quoter, deployed);
        }

        // V4 State View
        v4StateView = IStateView(
            Create2.computeAddress(
                BYTES32_ZERO,
                keccak256(abi.encodePacked(type(StateView).creationCode, abi.encode(v4PoolManager)))
            )
        );
        if (address(v4StateView).code.length == 0) {
            address deployed = address(new StateView{salt: BYTES32_ZERO}(IPoolManager(v4PoolManager)));
            assertEq(v4StateView, deployed);
        }

        // Router Params
        params = RouterParameters({
            permit2: permit2,
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
        address ism = Create2.computeAddress(BYTES32_ZERO, keccak256(abi.encodePacked(type(NoopIsm).creationCode)));
        if (ism.code.length == 0) {
            address deployed = address(new NoopIsm{salt: BYTES32_ZERO}());
            assertEq(deployed, ism);
        }
        address hook = Create2.computeAddress(
            BYTES32_ZERO,
            keccak256(abi.encodePacked(type(PausableHook).creationCode))
        );
        if (hook.code.length == 0) {
            address deployed = address(new PausableHook{salt: BYTES32_ZERO}());
            assertEq(deployed, hook);
        }
        address mailbox = Create2.computeAddress(
            BYTES32_ZERO,
            keccak256(abi.encodePacked(type(Mailbox).creationCode, abi.encode(uint32(block.chainId))))
        );
        if (mailbox.code.length == 0) {
            address deployed = address(new Mailbox{salt: BYTES32_ZERO}(uint32(block.chainId)));
            assertEq(deployed, hook);
            mailbox.initialize(msg.sender, address(ism), address(hook), address(hook));
        }

        hyperlaneParams = HyperlaneParameters({mailbox: mailbox});
    }
}
