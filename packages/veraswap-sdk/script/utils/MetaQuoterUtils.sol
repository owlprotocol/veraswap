// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {Vm} from "forge-std/Vm.sol";

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {MetaQuoter} from "../../contracts/uniswap/MetaQuoter.sol";
import {Create2Utils} from "./Create2Utils.sol";

library MetaQuoterUtils {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function getDeployBytecode(
        address v2Factory,
        bytes32 v2PoolInitCodeHash,
        address v3Factory,
        bytes32 v3PoolInitCodeHash,
        address v4PoolManager,
        address weth9
    ) internal pure returns (bytes memory) {
        return
            abi.encodePacked(
                type(MetaQuoter).creationCode,
                abi.encode(v2Factory, v2PoolInitCodeHash, v3Factory, v3PoolInitCodeHash, v4PoolManager, weth9)
            );
    }

    function getOrCreate2(
        address v2Factory,
        bytes32 v2PoolInitCodeHash,
        address v3Factory,
        bytes32 v3PoolInitCodeHash,
        address v4PoolManager,
        address weth9
    ) internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(
            getDeployBytecode(v2Factory, v2PoolInitCodeHash, v3Factory, v3PoolInitCodeHash, v4PoolManager, weth9)
        );
        if (!exists) {
            address deployed = address(
                new MetaQuoter{salt: Create2Utils.BYTES32_ZERO}(
                    v2Factory,
                    v2PoolInitCodeHash,
                    v3Factory,
                    v3PoolInitCodeHash,
                    IPoolManager(v4PoolManager),
                    weth9
                )
            );
            vm.assertEq(deployed, addr);
        }
    }
}
