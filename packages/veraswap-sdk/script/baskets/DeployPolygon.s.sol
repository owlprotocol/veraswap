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

        // Conservative Basket
        address WBTC = 0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6;
        address WETH = 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619;

        address[] memory conservativeTokens = new address[](2);
        conservativeTokens[0] = WBTC;
        conservativeTokens[1] = WETH;

        // Create conservative basket
        BasketFixedUnits.BasketToken[] memory conservativeBasket = new BasketFixedUnits.BasketToken[](2);
        conservativeBasket[0] = BasketFixedUnits.BasketToken({addr: WBTC, units: 10e5}); // 1/1000 WBTC
        conservativeBasket[1] = BasketFixedUnits.BasketToken({addr: WETH, units: 0.04 ether}); // 1/25 WETH
        (address conservativeBasketAddr,) = BasketFixedUnitsUtils.getOrCreate2(
            "Conservative Basket ETH/BTC 50",
            "CB.ETH/BTC.50",
            0xAAb6f44B46f19d061582727B66C9a0c84C97a2F6,
            5_000,
            conservativeBasket
        );

        console2.log("Conservative basket on polygon:", conservativeBasketAddr);

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

        // Polygon Infra Basket By Market Cap
        address LINK = 0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39;
        address UNI = 0xb33EaAd8d922B1083446DC23f610c2567fB5180f;
        address LDO = 0xC3C7d422809852031b44ab29EEC9F1EfF2A58756;
        address AAVE = 0xD6DF932A45C0f255f85145f286eA0b292B21C90B;

        address[] memory infraTokens = new address[](4);
        infraTokens[0] = LINK;
        infraTokens[1] = UNI;
        infraTokens[2] = LDO;
        infraTokens[3] = AAVE;

        // Create infra basket
        BasketFixedUnits.BasketToken[] memory infraBasket = new BasketFixedUnits.BasketToken[](4);
        infraBasket[0] = BasketFixedUnits.BasketToken({addr: LINK, units: 1000 ether});
        infraBasket[1] = BasketFixedUnits.BasketToken({addr: UNI, units: 1000 ether});
        infraBasket[2] = BasketFixedUnits.BasketToken({addr: LDO, units: 7000 ether});
        infraBasket[3] = BasketFixedUnits.BasketToken({addr: AAVE, units: 6 ether});
        (address infraBasketAddr,) = BasketFixedUnitsUtils.getOrCreate2(
            "Polyong Infra Basket Market Cap", "PIB.MC", 0xAAb6f44B46f19d061582727B66C9a0c84C97a2F6, 5_000, infraBasket
        );

        console2.log("Infra basket on polygon:", infraBasketAddr);

        for (uint256 i = 0; i < infraTokens.length; i++) {
            address token = infraTokens[i];

            uint256 allowancePermit2 = IERC20(token).allowance(executeSweep, Permit2Utils.permit2);
            if (allowancePermit2 == 0) {
                ExecuteSweep(payable(executeSweep)).approveAll(token, Permit2Utils.permit2);
            }

            (uint160 allowance,,) =
                IAllowanceTransfer(Permit2Utils.permit2).allowance(executeSweep, token, infraBasketAddr);

            if (allowance == 0) {
                ExecuteSweep(payable(executeSweep)).approveAll(token, infraBasketAddr);
            }
        }

        vm.stopBroadcast();
    }
}
