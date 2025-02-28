
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "forge-std/console2.sol";
import "forge-std/Test.sol";

import {VmSafe} from "forge-std/Vm.sol";

import {Execute} from "./Execute.sol";

import {HypERC20} from "hyperlane-monorepo/solidity/contracts/token/HypERC20.sol";

contract DeploySepoliaCollateral is Script, Test {

    function setUp() public {}

    function run() external {
        vm.startBroadcast();

        testLifeCycle();

        vm.stopBroadcast();
    }

    function testLifeCycle() public {
        address mailbox = 0x598facE78a4302f11E3de0bee1894Da0b2Cb71F8;
        string memory name = "Token A";
        string memory symbol = "A";

        address owner = msg.sender;

        HypERC20 tokenSynthetic = new HypERC20(
            18,
            address(mailbox)
        );

        // default ism/hook
        tokenSynthetic.initialize(0, name, symbol, address(0), address(0), owner);

        console2.log("Token HypERC20 deployed at:", address(tokenSynthetic));
    }
}
