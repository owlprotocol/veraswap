// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "forge-std/console2.sol";
import "forge-std/Test.sol";

import {VmSafe} from "forge-std/Vm.sol";

import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {IUniversalRouter} from "@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol";
import {UniversalRouterApprovedReentrant} from "../contracts/UniversalRouterApprovedReentrant.sol";
import {DeployParameters} from "./DeployParameters.s.sol";

abstract contract DeployRouter is DeployParameters {
    function deployRouter() internal {
        //TODO: Use CREATE2 existance check???
        /*
        address routerAddress = Create2.computeAddress(
            BYTES32_ZERO,
            keccak256(abi.encodePacked(type(UniversalRouterApprovedReentrant).creationCode, abi.encode(params)))
        );
        if (routerAddress.code.length == 0) {
            address deployed = address(new UniversalRouterApprovedReentrant{salt: BYTES32_ZERO}(params));
            assertEq(deployed, routerAddress);
        }

        router = IUniversalRouter(routerAddress);
        */
        router = IUniversalRouter(new UniversalRouterApprovedReentrant{salt: BYTES32_ZERO}(params));
    }
}
