// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/console2.sol";
import "forge-std/Script.sol";
import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";

contract MintTokens is Script {
    bytes constant ZERO_BYTES = new bytes(0);

    function run() external virtual {
        vm.startBroadcast();
        address account = 0xcD7F61Eb4bD8Fb4F5916Ddaba79b9071aA113b1F;

        MockERC20 tokenA = MockERC20(0x48824f0345964D1002bF4Ddd1F72BA99B5dbE5d5);
        MockERC20 tokenB = MockERC20(0x5710586e8D18F2e1c54c7a2247c1977578B11809);

        tokenA.mint(account, 1 ether);
        tokenB.mint(account, 1 ether);

        // uint256 value = 1e7 gwei;
        // account.call{value: value}(ZERO_BYTES);
        vm.stopBroadcast();
    }
}
