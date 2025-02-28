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

        // Lock collateral
        tokenACollateral.transferRemoteLock();
        // Deposit ERC20
        tokenA.mint(msg.sender, 5);
        // Unlock collateral
        tokenACollateral.transferRemoteUnlock(1, bytes32(uint256(2)));

        console2.log("balance collateral:", tokenA.balanceOf(address(tokenACollateral)));
    }
}
