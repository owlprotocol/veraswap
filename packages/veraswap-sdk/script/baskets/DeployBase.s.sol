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

contract DeployBase is Script {
    function run() external virtual {
        vm.startBroadcast();
        address ALLIANCE = 0xe4F9eBeECe51Bd992A2bF1Da40464b7BD7EB5EbC; // Alliance DAO Address

        address VIRTUAL = 0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b; //5
        address ZORA = 0x1111111111166b7FE7bd91427724B487980aFc69; //1000
        address KAITO = 0x98d0baa52b2D063E780DE12F615f963Fe8537553; //5

        address[] memory tokensImran = new address[](3);
        tokensImran[0] = VIRTUAL;
        tokensImran[1] = ZORA;
        tokensImran[2] = KAITO;

        // Create conservative basket
        BasketFixedUnits.BasketToken[] memory basketImran = new BasketFixedUnits.BasketToken[](3);
        basketImran[0] = BasketFixedUnits.BasketToken({addr: VIRTUAL, units: 5});
        basketImran[1] = BasketFixedUnits.BasketToken({addr: ZORA, units: 1000});
        basketImran[2] = BasketFixedUnits.BasketToken({addr: KAITO, units: 5});

        (address basketImranAddr, ) = BasketFixedUnitsUtils.getOrCreate2(
            "Emperor Khan Super Special",
            "EKSS",
            ALLIANCE,
            5_000,
            basketImran
        );

        console2.log("Basket Imran", basketImranAddr);

        // Set ExecuteSweep approvals
        (address executeSweep, ) = ExecuteSweepUtils.getOrCreate2();
        for (uint256 i = 0; i < tokensImran.length; i++) {
            address token = tokensImran[i];

            // Approve Permit2
            uint256 allowancePermit2 = IERC20(token).allowance(executeSweep, Permit2Utils.permit2);
            if (allowancePermit2 == 0) {
                ExecuteSweep(payable(executeSweep)).approveAll(token, Permit2Utils.permit2);
            }

            // Approve basket
            (uint160 allowance, , ) = IAllowanceTransfer(Permit2Utils.permit2).allowance(
                executeSweep,
                token,
                basketImranAddr
            );
            if (allowance == 0) {
                ExecuteSweep(payable(executeSweep)).approveAll(token, basketImranAddr);
            }
        }
        vm.stopBroadcast();
    }
}
