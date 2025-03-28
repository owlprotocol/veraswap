// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {RouterParameters} from "@uniswap/universal-router/contracts/types/RouterParameters.sol";
import {HyperlaneDeployParams} from "../Structs.sol";

library DeployBaseGoerli {
    bytes32 constant BYTES32_ZERO = bytes32(0);
    address constant UNSUPPORTED_PROTOCOL = address(0);

    function getParams()
        internal
        pure
        returns (RouterParameters memory uniswapParams, HyperlaneDeployParams memory hyperlaneParams)
    {
        uniswapParams = RouterParameters({
            permit2: 0x000000000022D473030F116dDEE9F6B43aC78BA3,
            weth9: 0x44D627f900da8AdaC7561bD73aA745F132450798,
            v2Factory: UNSUPPORTED_PROTOCOL,
            v3Factory: 0x9323c1d6D800ed51Bd7C6B216cfBec678B7d0BC2,
            pairInitCodeHash: BYTES32_ZERO,
            poolInitCodeHash: 0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54,
            v4PoolManager: UNSUPPORTED_PROTOCOL,
            v3NFTPositionManager: UNSUPPORTED_PROTOCOL,
            v4PositionManager: UNSUPPORTED_PROTOCOL
        });

        hyperlaneParams = HyperlaneDeployParams({mailbox: address(0)});
    }
}
