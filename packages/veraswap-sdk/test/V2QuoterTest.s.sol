// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {UniswapV2FactoryUtils} from "../script/utils/UniswapV2FactoryUtils.sol";

contract V2QuoterTest is Test {
    function setUp() public {
        // Sets proper address for Create2 & transaction sender
        vm.startBroadcast();

        (address addr, bool exists) = UniswapV2FactoryUtils.getOrCreate2(address(0));
        assertGt(addr.code.length, 0);

        vm.stopBroadcast();
    }

    function testExactInputSingle() public {}
}
