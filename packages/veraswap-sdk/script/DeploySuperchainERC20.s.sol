// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "forge-std/console2.sol";
import "forge-std/Test.sol";

import {MockSuperchainERC20} from "../../test/MockSuperchainERC20.sol";
import {IAllowanceTransfer} from "permit2/src/interfaces/IAllowanceTransfer.sol";
import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {DeployParameters} from "./DeployParameters.s.sol";

contract DeploySuperchainERC20 is DeployParameters {
    function setUp() public override {}

    function run() external {
        vm.startBroadcast();
        deploySuperTokens();
        vm.stopBroadcast();
    }

    function deploySuperTokens() internal {
        deploySuperToken("Super A", "A", 18);
        deploySuperToken("Super B", "B", 18);
    }

    function deploySuperToken(
        string memory name,
        string memory symbol,
        uint8 decimals
    ) internal returns (MockSuperchainERC20 token) {
        address tokenAddress = Create2.computeAddress(
            BYTES32_ZERO,
            keccak256(bytes.concat(type(MockSuperchainERC20).creationCode, abi.encode(name, symbol, decimals))),
            DETERMINISTIC_DEPLOYER
        );
        token = MockSuperchainERC20(tokenAddress);

        if (tokenAddress.code.length == 0) {
            address deployed = address(new MockSuperchainERC20{salt: BYTES32_ZERO}(name, symbol, decimals));
            assertEq(deployed, address(token));

            // Mint
            token.mint(msg.sender, 100_000 ether);
            // Approve Permit2
            token.approve(address(permit2), type(uint256).max);
            // Approve PositionManager using Permit2
            permit2.approve(address(token), params.v4PositionManager, type(uint160).max, type(uint48).max);
            // Approve UnversalRouter using Permit2
            /*
            IAllowanceTransfer(params.permit2).approve(
                address(token),
                address(router),
                type(uint160).max,
                type(uint48).max
            );
            */
        }
    }
}
