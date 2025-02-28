// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "forge-std/console2.sol";
import "forge-std/Test.sol";

import {VmSafe} from "forge-std/Vm.sol";

import {Execute} from "./Execute.sol";
import {HypERC20FlashCollateral} from "../contracts/token/HypERC20FlashCollateral.sol";

contract DeploySepoliaCollateral is Script, Test {
    function setUp() public {}

    function run() external {
        vm.startBroadcast();

        testLifeCycle();

        vm.stopBroadcast();
    }

    function testLifeCycle() public {
        address token  = 0x6A9996e0aeB928820cFa1a1dB7C62bA61B473280;
        address mailbox = 0xfFAEF09B3cd11D9b20d1a19bECca54EEC2884766;

        address owner = msg.sender;

        HypERC20FlashCollateral tokenCollateral = new HypERC20FlashCollateral(
            address(token),
            address(mailbox)
        );

        tokenCollateral.initialize(address(0), address(0), owner);

        console2.log("Token HypERC20FlashCollateral deployed at:", address(tokenCollateral));
    }
}
