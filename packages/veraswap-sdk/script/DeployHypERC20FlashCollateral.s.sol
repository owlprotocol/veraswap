// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "forge-std/console2.sol";
import "forge-std/Test.sol";

import {VmSafe} from "forge-std/Vm.sol";

import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";
import {Mailbox} from "@hyperlane-xyz/core/Mailbox.sol";
import {NoopIsm} from "@hyperlane-xyz/core/isms/NoopIsm.sol";
import {PausableHook} from "@hyperlane-xyz/core/hooks/PausableHook.sol";

import {Execute} from "./Execute.sol";
import {HypERC20FlashCollateral} from "../contracts/token/HypERC20FlashCollateral.sol";

contract DeployHypERC20FlashCollateral is Script, Test {
    bytes32 constant BYTES32_ZERO = bytes32(0);
    bytes constant ZERO_BYTES = new bytes(0);

    function setUp() public {}

    function run() external {
        vm.startBroadcast();

        testLifeCycle();

        vm.stopBroadcast();
    }

    function testLifeCycle() public {
        // Deploy Token
        MockERC20 tokenA = new MockERC20{salt: BYTES32_ZERO}("MockA", "A", 18);

        // Deploy Hyperlane
        address owner = msg.sender;

        NoopIsm ism = new NoopIsm{salt: BYTES32_ZERO}();
        PausableHook hook = new PausableHook{salt: BYTES32_ZERO}();
        Mailbox mailbox = new Mailbox{salt: BYTES32_ZERO}(uint32(block.chainid));
        mailbox.initialize(owner, address(ism), address(hook), address(hook));

        HypERC20FlashCollateral tokenACollateral = new HypERC20FlashCollateral{salt: BYTES32_ZERO}(
            address(tokenA),
            address(mailbox)
        );

        // default ism/hook
        tokenACollateral.initialize(address(0), address(0), owner);
        // set remote token chainId 1, address 1
        tokenACollateral.enrollRemoteRouter(1, bytes32(uint256(1)));

        // Deploy Execute
        console2.log("balance collateral:", tokenA.balanceOf(address(tokenACollateral)));

        Execute execute = new Execute{salt: BYTES32_ZERO}();
        address[] memory target = new address[](3);
        uint256[] memory value = new uint256[](3);
        bytes[] memory data = new bytes[](3);
        // Lock collateral
        target[0] = address(tokenACollateral);
        data[0] = abi.encodeWithSelector(tokenACollateral.transferRemoteLock.selector);
        // Deposit ERC20
        target[1] = address(tokenA);
        data[1] = abi.encodeWithSelector(tokenA.mint.selector, address(tokenACollateral), 5);
        // Unlock collateral
        target[2] = address(tokenACollateral);
        data[2] = abi.encodeWithSelector(tokenACollateral.transferRemoteUnlock.selector, bytes32(uint256(1)));

        execute.executeBatch(target, value, data);

        console2.log("balance collateral:", tokenA.balanceOf(address(tokenACollateral)));
    }
}
