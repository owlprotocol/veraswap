// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {DeployParams} from "../Structs.sol";

import {DeployArbitrum} from "../deployParameters/DeployArbitrum.s.sol";
import {DeployArbitrumGoerli} from "../deployParameters/DeployArbitrumGoerli.s.sol";
import {DeployAvalanche} from "../deployParameters/DeployAvalanche.s.sol";
import {DeployBase} from "../deployParameters/DeployBase.s.sol";
import {DeployBaseGoerli} from "../deployParameters/DeployBaseGoerli.s.sol";
import {DeployBaseSepolia} from "../deployParameters/DeployBaseSepolia.s.sol";
import {DeployBlast} from "../deployParameters/DeployBlast.s.sol";
import {DeployBSC} from "../deployParameters/DeployBSC.s.sol";
import {DeployCelo} from "../deployParameters/DeployCelo.s.sol";
import {DeployCeloAlfajores} from "../deployParameters/DeployCeloAlfajores.s.sol";
import {DeployGoerli} from "../deployParameters/DeployGoerli.s.sol";
import {DeployInk} from "../deployParameters/DeployInk.s.sol";
import {DeployInterop0} from "../deployParameters/DeployInterop0.s.sol";
import {DeployInterop1} from "../deployParameters/DeployInterop1.s.sol";
import {DeployMainnet} from "../deployParameters/DeployMainnet.s.sol";
import {DeployOptimism} from "../deployParameters/DeployOptimism.s.sol";
import {DeployOptimismGoerli} from "../deployParameters/DeployOptimismGoerli.s.sol";
import {DeployOPSepolia} from "../deployParameters/DeployOPSepolia.s.sol";
import {DeployPolygon} from "../deployParameters/DeployPolygon.s.sol";
import {DeployPolygonMumbai} from "../deployParameters/DeployPolygonMumbai.s.sol";
import {DeploySepolia} from "../deployParameters/DeploySepolia.s.sol";
import {DeploySoneium} from "../deployParameters/DeploySoneium.s.sol";
import {DeployStory} from "../deployParameters/DeployStory.s.sol";
import {DeploySuperseed} from "../deployParameters/DeploySuperseed.s.sol";
import {DeployUnichain} from "../deployParameters/DeployUnichain.s.sol";
import {DeployUnichainSepolia} from "../deployParameters/DeployUnichainSepolia.s.sol";
import {DeployWorldchain} from "../deployParameters/DeployWorldchain.s.sol";
import {DeployZora} from "../deployParameters/DeployZora.s.sol";

library ContractParams {
    error UnsupportedChainId(uint256 chainId);

    function getParams(uint256 chainId) internal pure returns (DeployParams memory params) {
        if (chainId == DeployArbitrum.chainId) {
            return DeployArbitrum.getParams();
        } else if (chainId == DeployArbitrumGoerli.chainId) {
            return DeployArbitrumGoerli.getParams();
        } else if (chainId == DeployAvalanche.chainId) {
            return DeployAvalanche.getParams();
        } else if (chainId == DeployBase.chainId) {
            return DeployBase.getParams();
        } else if (chainId == DeployBaseGoerli.chainId) {
            return DeployBaseGoerli.getParams();
        } else if (chainId == DeployBaseSepolia.chainId) {
            return DeployBaseSepolia.getParams();
        } else if (chainId == DeployBlast.chainId) {
            return DeployBlast.getParams();
        } else if (chainId == DeployBSC.chainId) {
            return DeployBSC.getParams();
        } else if (chainId == DeployCelo.chainId) {
            return DeployCelo.getParams();
        } else if (chainId == DeployCeloAlfajores.chainId) {
            return DeployCeloAlfajores.getParams();
        } else if (chainId == DeployGoerli.chainId) {
            return DeployGoerli.getParams();
        } else if (chainId == DeployInk.chainId) {
            return DeployInk.getParams();
        } else if (chainId == DeployInterop0.chainId) {
            return DeployInterop0.getParams();
        } else if (chainId == DeployInterop1.chainId) {
            return DeployInterop1.getParams();
        } else if (chainId == DeployMainnet.chainId) {
            return DeployMainnet.getParams();
        } else if (chainId == DeployOptimism.chainId) {
            return DeployOptimism.getParams();
        } else if (chainId == DeployOptimismGoerli.chainId) {
            return DeployOptimismGoerli.getParams();
        } else if (chainId == DeployOPSepolia.chainId) {
            return DeployOPSepolia.getParams();
        } else if (chainId == DeployPolygon.chainId) {
            return DeployPolygon.getParams();
        } else if (chainId == DeployPolygonMumbai.chainId) {
            return DeployPolygonMumbai.getParams();
        } else if (chainId == DeploySepolia.chainId) {
            return DeploySepolia.getParams();
        } else if (chainId == DeploySoneium.chainId) {
            return DeploySoneium.getParams();
        } else if (chainId == DeployStory.chainId) {
            return DeployStory.getParams();
        } else if (chainId == DeploySuperseed.chainId) {
            return DeploySuperseed.getParams();
        } else if (chainId == DeployUnichain.chainId) {
            return DeployUnichain.getParams();
        } else if (chainId == DeployUnichainSepolia.chainId) {
            return DeployUnichainSepolia.getParams();
        } else if (chainId == DeployWorldchain.chainId) {
            return DeployWorldchain.getParams();
        } else if (chainId == DeployZora.chainId) {
            return DeployZora.getParams();
        } else {
            revert UnsupportedChainId(chainId);
        }
    }
}
