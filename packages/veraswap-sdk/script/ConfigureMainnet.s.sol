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
        string[] memory chains = new string[](5);
        chains[0] = "base";
        chains[1] = "optimism";
        chains[2] = "superseed";
        chains[3] = "arbitrum";
        chains[4] = "bsc";
        // chains[4] = "unichain";
        // chains[7] = "mainnet";

        (uint256[] memory chainIds, uint256[] memory forks) = MultichainFork.getForks(chains);

        // Base
        hypERC20CollateralTokens[chainIds[0]].push(0x955132016f9B6376B1392aA7BFF50538d21Ababc); // USDC
        hypERC20CollateralTokens[chainIds[0]].push(0x66477F84bd21697c7781fc3992b3163463e3B224); // CBBTC
        hypERC20CollateralTokens[chainIds[0]].push(0x458BDDd0793fe4f70912535f172466a5473f2e77); // SUPR
        hypERC20CollateralTokens[chainIds[0]].push(0x2552516453368e42705D791F674b312b8b87CD9e); // ezETH
        // Optimism
        hypERC20CollateralTokens[chainIds[1]].push(0x741B077c69FA219CEdb11364706a3880A792423e); // USDC
        hypERC20CollateralTokens[chainIds[1]].push(0xae1E04F18D1323d8EaC7Ba5b2c683c95DC3baC97); // SUPR
        hypERC20CollateralTokens[chainIds[1]].push(0xacEB607CdF59EB8022Cc0699eEF3eCF246d149e2); // ezETH
        hypERC20CollateralTokens[chainIds[1]].push(0x0Ea3C23A4dC198c289D5443ac302335aBc86E6b1); // OP
        // Superseed
        hypERC20CollateralTokens[chainIds[2]].push(0xa7D6042eEf06E81168e640b5C41632eE5295227D); // USDC
        hypERC20CollateralTokens[chainIds[2]].push(0x0a78BC3CBBC79C4C6E5d4e5b2bbD042E58e93484); // CBBTC
        hypERC20CollateralTokens[chainIds[2]].push(0xA1863B4b02b7DCd7429F62C775816328D63020F4); // SUPR
        // Arbitrum
        hypERC20CollateralTokens[chainIds[3]].push(0xB26bBfC6d1F469C821Ea25099017862e7368F4E8); // ezETH
        // BSC
        hypERC20CollateralTokens[chainIds[4]].push(0xE00C6185a5c19219F1FFeD213b4406a254968c26); // ezETH
        // Mainnet
        // hypERC20CollateralTokens[chainIds[5]].push(0x7710d2FC9A2E0452b28a2cBf550429b579347199); // CBBTC
        // hypERC20CollateralTokens[chainIds[5]].push(0xbc808c98beA0a097346273A9Fd7a5B231fc2d889); // SUPR
        // hypERC20CollateralTokens[chainIds[5]].push(0xC59336D8edDa9722B4f1Ec104007191Ec16f7087); // ezETH

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
