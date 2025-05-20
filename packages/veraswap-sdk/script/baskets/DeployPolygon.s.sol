// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
// Baskets
import {BasketFixedUnits} from "../../contracts/vaults/BasketFixedUnits.sol";
import {BasketFixedUnitsUtils} from "../utils/BasketFixedUnitsUtils.sol";
// Pemit2
import {Permit2Utils} from "../utils/Permit2Utils.sol";
import {IAllowanceTransfer} from "permit2/src/interfaces/IAllowanceTransfer.sol";

import {ExecuteSweep} from "../../contracts/ExecuteSweep.sol";
import {ExecuteSweepUtils} from "../utils/ExecuteSweepUtils.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";

contract DeployPolygon is Script {
    function run() external virtual {
        vm.startBroadcast();

        (address executeSweep,) = ExecuteSweepUtils.getOrCreate2();

        address WBTC = 0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6;
        address WETH = 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619;

        address[] memory conservativeTokens = new address[](2);
        conservativeTokens[0] = WBTC;
        conservativeTokens[1] = WETH;

        // Create conservative basket
        BasketFixedUnits.BasketToken[] memory conservativeBasket = new BasketFixedUnits.BasketToken[](2);
        conservativeBasket[0] = BasketFixedUnits.BasketToken({addr: WBTC, units: 1});
        conservativeBasket[1] = BasketFixedUnits.BasketToken({addr: WETH, units: 40});
        (address conservativeBasketAddr,) = BasketFixedUnitsUtils.getOrCreate2(
            "Conservative Basket ETH/BTC 50",
            "CB.ETH/BTC.50",
            0xAAb6f44B46f19d061582727B66C9a0c84C97a2F6,
            5_000,
            conservativeBasket
        );

        console2.log("Conservative basket on bsc:", conservativeBasketAddr);

        for (uint256 i = 0; i < conservativeTokens.length; i++) {
            address token = conservativeTokens[i];

            uint256 allowancePermit2 = IERC20(token).allowance(executeSweep, Permit2Utils.permit2);
            if (allowancePermit2 == 0) {
                ExecuteSweep(payable(executeSweep)).approveAll(token, Permit2Utils.permit2);
            }

            (uint160 allowance,,) =
                IAllowanceTransfer(Permit2Utils.permit2).allowance(executeSweep, token, conservativeBasketAddr);

            if (allowance == 0) {
                ExecuteSweep(payable(executeSweep)).approveAll(token, conservativeBasketAddr);
            }
        }
        vm.stopBroadcast();
    }
}
