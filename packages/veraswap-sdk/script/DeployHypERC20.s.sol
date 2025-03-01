// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/console2.sol";
import "forge-std/Script.sol";

import {HypERC20} from "@hyperlane-xyz/core/token/HypERC20.sol";
import {HypERC20Utils} from "./utils/HypERC20Utils.sol";

contract DeployParameters is Script {
    function run() external virtual {
        vm.startBroadcast();

        //base
        address mailboxBase = 0x6966b0E55883d49BFB24539356a2f8A673E02039;
        // address mailboxOptimism = 0x6966b0E55883d49BFB24539356a2f8A673E02039;
        // address mailboxUnichain = 0xDDcFEcF17586D08A5740B7D91735fcCE3dfe3eeD;
        // address mailboxInk = 0xDDcFEcF17586D08A5740B7D91735fcCE3dfe3eeD;

        address mailbox = mailboxBase;
        //Canonical Tokens
        // address tokenAAddr = 0xFA306dFDe7632a6c74bdaBbBB19fA59c7A78D73B;
        // address tokenBAddr = 0xf79509E6faDC7254D59d49Bcd976d5523177ec4f;
        //Collateral Tokens
        address collateralA = 0xE3664722A685de10B27460D9097767813B5E0459;
        address collateralB = 0x5F2785F8C06fff20F44E7D1c4940694Cd271343b;
        (address wrappedAAddr, ) = HypERC20Utils.getOrCreate2(18, mailbox, 0, "Token A", "A");
        (address wrappedBAddr, ) = HypERC20Utils.getOrCreate2(18, mailbox, 0, "Token B", "B");

        HypERC20(wrappedAAddr).enrollRemoteRouter(11_155_111, bytes32(uint256(uint160(collateralA))));
        HypERC20(wrappedBAddr).enrollRemoteRouter(11_155_111, bytes32(uint256(uint160(collateralB))));

        vm.stopBroadcast();
    }
}
