// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/Test.sol";

import {RouterParameters} from "@uniswap/universal-router/contracts/types/RouterParameters.sol";
import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {UnsupportedProtocol} from "@uniswap/universal-router/contracts/deploy/UnsupportedProtocol.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolManager} from "@uniswap/v4-core/src/PoolManager.sol";
import {PositionManager} from "@uniswap/v4-periphery/src/PositionManager.sol";
import {IPositionDescriptor} from "@uniswap/v4-periphery/src/interfaces/IPositionDescriptor.sol";
import {IWETH9} from "@uniswap/v4-periphery/src/interfaces/external/IWETH9.sol";
import {IAllowanceTransfer} from "permit2/src/interfaces/IAllowanceTransfer.sol";

import {DeployPermit2} from "../../test/utils/forks/DeployPermit2.sol";
import {DeployParameters} from "../DeployParameters.s.sol";

contract DeployAnvil is DeployParameters, DeployPermit2, Test {
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
            keccak256(abi.encodePacked(type(PoolManager).creationCode, address(0)))
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
                    v4PoolManager,
                    permit2,
                    uint256(300_000),
                    address(0),
                    address(0)
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

        unsupported = address(1);
    }
}
