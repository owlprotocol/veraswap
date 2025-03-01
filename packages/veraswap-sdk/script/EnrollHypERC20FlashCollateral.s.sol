// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/console2.sol";
import "forge-std/Script.sol";

import {HypERC20FlashCollateral} from "../contracts/token/HypERC20FlashCollateral.sol";
import {HypERC20FlashCollateralUtils} from "./utils/HypERC20FlashCollateralUtils.sol";

contract EnrollHypERC20FlashCollateral is Script {
    function run() external virtual {
        vm.startBroadcast();

        //base
        address tokenABase = 0x05CAD57113cb3fa213982Dc9553498018C1D08b7;
        address tokenBBase = 0x3744D204595AF66329B325A7651B005FbDCd77A4;
        address tokenAInk = 0x274d622AFa517251bdF73ea08377B78DD9f49F2B;
        address tokenBInk = 0x5983458D6d58B80257744872A778ECE9e82CEEC0;
        address tokenAUnichain = 0x274d622AFa517251bdF73ea08377B78DD9f49F2B;
        address tokenBUnichain = 0x5983458D6d58B80257744872A778ECE9e82CEEC0;

        // address mailboxSepolia = 0xfFAEF09B3cd11D9b20d1a19bECca54EEC2884766;
        // address mailboxOptimism = 0x6966b0E55883d49BFB24539356a2f8A673E02039;
        // address mailboxBase = 0x6966b0E55883d49BFB24539356a2f8A673E02039;
        // address mailboxUnichain = 0xDDcFEcF17586D08A5740B7D91735fcCE3dfe3eeD;
        // address mailboxInk = 0xDDcFEcF17586D08A5740B7D91735fcCE3dfe3eeD;

        //Canonical Tokens
        // address tokenAAddr = 0xFA306dFDe7632a6c74bdaBbBB19fA59c7A78D73B;
        // address tokenBAddr = 0xf79509E6faDC7254D59d49Bcd976d5523177ec4f;
        //Collateral Tokens
        address collateralA = 0xE3664722A685de10B27460D9097767813B5E0459;
        address collateralB = 0x5F2785F8C06fff20F44E7D1c4940694Cd271343b;

        HypERC20FlashCollateral(collateralA).enrollRemoteRouter(84532, bytes32(uint256(uint160(tokenABase))));
        HypERC20FlashCollateral(collateralB).enrollRemoteRouter(84532, bytes32(uint256(uint160(tokenBBase))));
        HypERC20FlashCollateral(collateralA).enrollRemoteRouter(1301, bytes32(uint256(uint160(tokenAUnichain))));
        HypERC20FlashCollateral(collateralB).enrollRemoteRouter(1301, bytes32(uint256(uint160(tokenBUnichain))));
        HypERC20FlashCollateral(collateralA).enrollRemoteRouter(763373, bytes32(uint256(uint160(tokenAInk))));
        HypERC20FlashCollateral(collateralB).enrollRemoteRouter(763373, bytes32(uint256(uint160(tokenBInk))));

        vm.stopBroadcast();
    }
}
