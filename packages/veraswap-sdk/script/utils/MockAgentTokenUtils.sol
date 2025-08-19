// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {Vm} from "forge-std/Vm.sol";

import {MockAgentToken} from "../../contracts/agent-token/MockAgentToken.sol";
import {Create2Utils} from "./Create2Utils.sol";

library MockAgentTokenUtils {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function getDeployBytecode(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint16 projectBuyTaxBasisPoints,
        uint16 projectSellTaxBasisPoints
    ) internal pure returns (bytes memory) {
        return abi.encodePacked(
            type(MockAgentToken).creationCode,
            abi.encode(name, symbol, decimals, projectBuyTaxBasisPoints, projectSellTaxBasisPoints)
        );
    }

    function getOrCreate2(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint16 projectBuyTaxBasisPoints,
        uint16 projectSellTaxBasisPoints
    ) internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(
            getDeployBytecode(name, symbol, decimals, projectBuyTaxBasisPoints, projectSellTaxBasisPoints)
        );
        if (!exists) {
            address deployed = address(
                new MockAgentToken{salt: Create2Utils.BYTES32_ZERO}(
                    name, symbol, decimals, projectBuyTaxBasisPoints, projectSellTaxBasisPoints
                )
            );
            vm.assertEq(deployed, addr);
        }
    }
}
