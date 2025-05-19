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

contract DeployBSC is Script {
    function run() external virtual {
        vm.startBroadcast();

        (address executeSweep,) = ExecuteSweepUtils.getOrCreate2();

        address WETH = 0x2170Ed0880ac9A755fd29B2688956BD959F933F8;
        address BTCB = 0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c;

        address[] memory conservativeTokens = new address[](2);
        conservativeTokens[0] = WETH;
        conservativeTokens[1] = BTCB;

        // Create conservative basket
        BasketFixedUnits.BasketToken[] memory conservativeBasket = new BasketFixedUnits.BasketToken[](2);
        conservativeBasket[0] = BasketFixedUnits.BasketToken({addr: WETH, units: 40});
        conservativeBasket[1] = BasketFixedUnits.BasketToken({addr: BTCB, units: 1});
        (address conservativeBasketAddr,) = BasketFixedUnitsUtils.getOrCreate2(
            "Conservative Basket ETH/BTC 50",
            "CB.ETH/BTC.50",
            0xAAb6f44B46f19d061582727B66C9a0c84C97a2F6,
            10_000,
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
