// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "forge-std/console2.sol";

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {HypERC20Collateral} from "@hyperlane-xyz/core/token/HypERC20Collateral.sol";

import {HypTokenRouterSweep} from "../contracts/hyperlane/HypTokenRouterSweep.sol";
import {HypTokenRouterSweepUtils} from "./utils/HypTokenRouterSweepUtils.sol";

import {MultichainFork} from "./MultichainFork.sol";

/**
 * Configure mainnet contracts
 * - HyperlaneSweeper
 */
contract DeployMainnet is Script {
    // Tokens with bytes32 identifiers
    mapping(uint256 chainId => address[]) public hypERC20CollateralTokens;

    function run() external virtual {
        string[] memory chains = new string[](4);
        chains[0] = "mainnet";
        chains[1] = "base";
        chains[2] = "optimism";
        chains[3] = "superseed";

        (uint256[] memory chainIds, uint256[] memory forks) = MultichainFork.getForks(chains);

        // Mainnet
        hypERC20CollateralTokens[chainIds[0]].push(0x7710d2FC9A2E0452b28a2cBf550429b579347199); // CBBTC
        // Base
        hypERC20CollateralTokens[chainIds[1]].push(0x955132016f9B6376B1392aA7BFF50538d21Ababc); // USDC
        hypERC20CollateralTokens[chainIds[1]].push(0x66477F84bd21697c7781fc3992b3163463e3B224); // CBBTC
        // Optimism
        hypERC20CollateralTokens[chainIds[2]].push(0x741B077c69FA219CEdb11364706a3880A792423e); // USDC
        // Superseed
        hypERC20CollateralTokens[chainIds[3]].push(0xa7D6042eEf06E81168e640b5C41632eE5295227D); // USDC
        hypERC20CollateralTokens[chainIds[3]].push(0x0a78BC3CBBC79C4C6E5d4e5b2bbD042E58e93484); // CBBTC

        for (uint256 i = 0; i < chains.length; i++) {
            vm.selectFork(forks[i]);
            vm.startBroadcast();

            // Check if sweeper exists
            (address hypTokenRouterSweep, bool exists) = HypTokenRouterSweepUtils.getAddressExists();

            if (exists) {
                // HypERC20Collateral tokens for chain
                address[] memory tokens = hypERC20CollateralTokens[chainIds[i]];
                for (uint256 j = 0; j < tokens.length; j++) {
                    // Check allowance IERC20(erc20).allowance(account: sweeper, spender: hypERC20Collateral)
                    address hypERC20Collateral = tokens[j];
                    address erc20 = address(HypERC20Collateral(hypERC20Collateral).wrappedToken());
                    uint256 allowance = IERC20(erc20).allowance(hypTokenRouterSweep, hypERC20Collateral);
                    if (allowance == 0) {
                        // Approve all
                        HypTokenRouterSweep(hypTokenRouterSweep).approveAll(erc20, hypERC20Collateral);
                    }
                }
            } else {
                console2.log("HypTokenRouterSweep not deployed on chain:", chainIds[i]);
            }

            vm.stopBroadcast();
        }
    }
}
