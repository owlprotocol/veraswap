// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "forge-std/Test.sol";

import {RouterParameters} from "@uniswap/universal-router/contracts/types/RouterParameters.sol";
import {HyperlaneDeployParams, DeployParams} from "./Structs.sol";

import {DeployArbitrum} from "./deployParameters/DeployArbitrum.s.sol";
import {DeployArbitrumGoerli} from "./deployParameters/DeployArbitrumGoerli.s.sol";
import {DeployAvalanche} from "./deployParameters/DeployAvalanche.s.sol";
import {DeployBase} from "./deployParameters/DeployBase.s.sol";
import {DeployBaseGoerli} from "./deployParameters/DeployBaseGoerli.s.sol";
import {DeployBaseSepolia} from "./deployParameters/DeployBaseSepolia.s.sol";
import {DeployBlast} from "./deployParameters/DeployBlast.s.sol";
import {DeployBSC} from "./deployParameters/DeployBSC.s.sol";
import {DeployCelo} from "./deployParameters/DeployCelo.s.sol";
import {DeployCeloAlfajores} from "./deployParameters/DeployCeloAlfajores.s.sol";
import {DeployGoerli} from "./deployParameters/DeployGoerli.s.sol";
import {DeployInk} from "./deployParameters/DeployInk.s.sol";
import {DeployMainnet} from "./deployParameters/DeployMainnet.s.sol";
import {DeployOptimism} from "./deployParameters/DeployOptimism.s.sol";
import {DeployOptimismGoerli} from "./deployParameters/DeployOptimismGoerli.s.sol";
import {DeployOPSepolia} from "./deployParameters/DeployOPSepolia.s.sol";
import {DeployPolygon} from "./deployParameters/DeployPolygon.s.sol";
import {DeployPolygonMumbai} from "./deployParameters/DeployPolygonMumbai.s.sol";
import {DeploySepolia} from "./deployParameters/DeploySepolia.s.sol";
import {DeploySoneium} from "./deployParameters/DeploySoneium.s.sol";
import {DeployUnichain} from "./deployParameters/DeployUnichain.s.sol";
import {DeployUnichainSepolia} from "./deployParameters/DeployUnichainSepolia.s.sol";
import {DeployWorldchain} from "./deployParameters/DeployWorldchain.s.sol";
import {DeployZora} from "./deployParameters/DeployZora.s.sol";

contract DeployParameters is Script, Test {
    mapping(uint256 chainId => DeployParams params) public deployParams;

    function setUp() external virtual {
        deployParams[DeployArbitrum.chainId] = DeployArbitrum.getParams();
        deployParams[DeployArbitrumGoerli.chainId] = DeployArbitrumGoerli.getParams();
        deployParams[DeployAvalanche.chainId] = DeployAvalanche.getParams();
        deployParams[DeployBase.chainId] = DeployBase.getParams();
        deployParams[DeployBaseGoerli.chainId] = DeployBaseGoerli.getParams();
        deployParams[DeployBaseSepolia.chainId] = DeployBaseSepolia.getParams();
        deployParams[DeployBlast.chainId] = DeployBlast.getParams();
        deployParams[DeployBSC.chainId] = DeployBSC.getParams();
        deployParams[DeployCelo.chainId] = DeployCelo.getParams();
        deployParams[DeployCeloAlfajores.chainId] = DeployCeloAlfajores.getParams();
        deployParams[DeployGoerli.chainId] = DeployGoerli.getParams();
        deployParams[DeployInk.chainId] = DeployInk.getParams();
        deployParams[DeployMainnet.chainId] = DeployMainnet.getParams();
        deployParams[DeployOptimism.chainId] = DeployOptimism.getParams();
        deployParams[DeployOptimismGoerli.chainId] = DeployOptimismGoerli.getParams();
        deployParams[DeployOPSepolia.chainId] = DeployOPSepolia.getParams();
        deployParams[DeployPolygon.chainId] = DeployPolygon.getParams();
        deployParams[DeployPolygonMumbai.chainId] = DeployPolygonMumbai.getParams();
        deployParams[DeploySepolia.chainId] = DeploySepolia.getParams();
        deployParams[DeploySoneium.chainId] = DeploySoneium.getParams();
        deployParams[DeployUnichain.chainId] = DeployUnichain.getParams();
        deployParams[DeployUnichainSepolia.chainId] = DeployUnichainSepolia.getParams();
        deployParams[DeployWorldchain.chainId] = DeployWorldchain.getParams();
        deployParams[DeployZora.chainId] = DeployZora.getParams();
    }
}
