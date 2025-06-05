// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "forge-std/console2.sol";

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {HypERC20Collateral} from "@hyperlane-xyz/core/token/HypERC20Collateral.sol";

import {HypTokenRouterSweep} from "../contracts/hyperlane/HypTokenRouterSweep.sol";
import {HypTokenRouterSweepUtils} from "./utils/HypTokenRouterSweepUtils.sol";
import {StargateBridgeSweep} from "contracts/stargate/StargateBridgeSweep.sol";
import {StargateBridgeSweepUtils} from "./utils/StargateBridgeSweepUtils.sol";

import {MultichainFork} from "./MultichainFork.sol";

/**
 * Configure mainnet contracts
 * - HyperlaneSweeper
 */
contract DeployMainnet is Script {
    // Tokens with bytes32 identifiers
    mapping(uint256 chainId => address[]) public hypERC20CollateralTokens;

    // Value is just a tuple of token then pool
    mapping(uint256 chainId => address[][]) public stargateTokenAndPools;

    function configureHypTokenRouterSweep(uint256 chainId) internal {
        // Check if sweeper exists
        (address hypTokenRouterSweep, bool exists) = HypTokenRouterSweepUtils.getAddressExists();

        if (exists) {
            // HypERC20Collateral tokens for chain
            address[] memory tokens = hypERC20CollateralTokens[chainId];
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
            console2.log("HypTokenRouterSweep not deployed on chain:", chainId);
        }
    }

    function configureStargateBridgeSweep(uint256 chainId) internal {
        // Check if sweeper exists
        (address stargateBridgeSweep, bool exists) = StargateBridgeSweepUtils.getAddressExists();

        if (exists) {
            address[][] memory tokenAndPool = stargateTokenAndPools[chainId];
            for (uint256 j = 0; j < tokenAndPool.length; j++) {
                address erc20 = tokenAndPool[j][0];
                address pool = tokenAndPool[j][1];

                uint256 allowance = IERC20(erc20).allowance(stargateBridgeSweep, pool);
                if (allowance == 0) {
                    // Approve all
                    StargateBridgeSweep(payable(stargateBridgeSweep)).approveAll(erc20, pool);
                }
            }
        } else {
            console2.log("StargateBridgeSweep not deployed on chain:", chainId);
        }
    }

    function run() external virtual {
        string[] memory chains = new string[](6);
        chains[0] = "base";
        chains[1] = "optimism";
        chains[2] = "superseed";
        chains[3] = "arbitrum";
        chains[4] = "bsc";
        chains[5] = "mainnet";
        // chains[4] = "unichain";

        (uint256[] memory chainIds, uint256[] memory forks) = MultichainFork.getForks(chains);

        // Base
        hypERC20CollateralTokens[chainIds[0]].push(0x955132016f9B6376B1392aA7BFF50538d21Ababc); // USDC
        hypERC20CollateralTokens[chainIds[0]].push(0x66477F84bd21697c7781fc3992b3163463e3B224); // CBBTC
        hypERC20CollateralTokens[chainIds[0]].push(0x458BDDd0793fe4f70912535f172466a5473f2e77); // SUPR
        hypERC20CollateralTokens[chainIds[0]].push(0x2552516453368e42705D791F674b312b8b87CD9e); // ezETH

        stargateTokenAndPools[chainIds[0]].push(
            [0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913, 0x27a16dc786820B16E5c9028b75B99F6f604b5d26]
        ); // USDC

        // Optimism
        hypERC20CollateralTokens[chainIds[1]].push(0x741B077c69FA219CEdb11364706a3880A792423e); // USDC
        hypERC20CollateralTokens[chainIds[1]].push(0xae1E04F18D1323d8EaC7Ba5b2c683c95DC3baC97); // SUPR
        hypERC20CollateralTokens[chainIds[1]].push(0xacEB607CdF59EB8022Cc0699eEF3eCF246d149e2); // ezETH
        hypERC20CollateralTokens[chainIds[1]].push(0x0Ea3C23A4dC198c289D5443ac302335aBc86E6b1); // OP

        stargateTokenAndPools[chainIds[1]].push(
            [0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85, 0xcE8CcA271Ebc0533920C83d39F417ED6A0abB7D0]
        ); // USDC

        // Superseed
        hypERC20CollateralTokens[chainIds[2]].push(0xa7D6042eEf06E81168e640b5C41632eE5295227D); // USDC
        hypERC20CollateralTokens[chainIds[2]].push(0x0a78BC3CBBC79C4C6E5d4e5b2bbD042E58e93484); // CBBTC
        hypERC20CollateralTokens[chainIds[2]].push(0xA1863B4b02b7DCd7429F62C775816328D63020F4); // SUPR

        // Arbitrum
        hypERC20CollateralTokens[chainIds[3]].push(0xB26bBfC6d1F469C821Ea25099017862e7368F4E8); // ezETH

        stargateTokenAndPools[chainIds[3]].push(
            [0xaf88d065e77c8cC2239327C5EDb3A432268e5831, 0xe8CDF27AcD73a434D661C84887215F7598e7d0d3]
        ); // USDC

        // BSC
        hypERC20CollateralTokens[chainIds[4]].push(0xE00C6185a5c19219F1FFeD213b4406a254968c26); // ezETH

        stargateTokenAndPools[chainIds[4]].push(
            [0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d, 0x962Bd449E630b0d928f308Ce63f1A21F02576057]
        ); // USDC

        // Mainnet
        // hypERC20CollateralTokens[chainIds[5]].push(0x7710d2FC9A2E0452b28a2cBf550429b579347199); // CBBTC
        // hypERC20CollateralTokens[chainIds[5]].push(0xbc808c98beA0a097346273A9Fd7a5B231fc2d889); // SUPR
        // hypERC20CollateralTokens[chainIds[5]].push(0xC59336D8edDa9722B4f1Ec104007191Ec16f7087); // ezETH

        stargateTokenAndPools[chainIds[5]].push(
            [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48, 0xc026395860Db2d07ee33e05fE50ed7bD583189C7]
        ); // USDC

        for (uint256 i = 0; i < chains.length; i++) {
            vm.selectFork(forks[i]);
            vm.startBroadcast();

            configureHypTokenRouterSweep(chainIds[i]);
            configureStargateBridgeSweep(chainIds[i]);

            vm.stopBroadcast();
        }
    }
}
