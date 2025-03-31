// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/console2.sol";
import "forge-std/Script.sol";
import "forge-std/Test.sol";

import {RouterParameters} from "@uniswap/universal-router/contracts/types/RouterParameters.sol";
import {HyperlaneDeployParams, DeployParams} from "./Structs.sol";

import {DeploySepolia} from "./deployParameters/DeploySepolia.s.sol";

contract DeployCoreContracts is Script, Test {
    mapping(uint256 chainId => DeployParams params) public deployParams;

    function setUp() external virtual {
        DeployParams memory params = DeploySepolia.getParams();
        deployParams[11155111].uniswap = params.uniswap;
        deployParams[11155111].hyperlane = params.hyperlane;
    }
}
