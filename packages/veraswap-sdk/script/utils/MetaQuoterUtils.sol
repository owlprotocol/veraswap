// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {Vm} from "forge-std/Vm.sol";

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {MetaQuoter} from "../../contracts/uniswap/MetaQuoter.sol";
import {Create2Utils} from "./Create2Utils.sol";

library MetaQuoterUtils {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function getDeployBytecode(
        address factory,
        bytes32 poolInitCodeHash,
        address poolManager,
        address weth9
    ) internal pure returns (bytes memory) {
        return
            abi.encodePacked(type(MetaQuoter).creationCode, abi.encode(factory, poolInitCodeHash, poolManager, weth9));
    }

    function getOrCreate2(
        address factory,
        bytes32 poolInitCodeHash,
        address poolManager,
        address weth9
    ) internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(
            getDeployBytecode(factory, poolInitCodeHash, poolManager, weth9)
        );
        if (!exists) {
            address deployed = address(
                new MetaQuoter{salt: Create2Utils.BYTES32_ZERO}(
                    factory,
                    poolInitCodeHash,
                    IPoolManager(poolManager),
                    weth9
                )
            );
            vm.assertEq(deployed, addr);
        }
    }
}
