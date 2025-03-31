// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {RouterParameters} from "@uniswap/universal-router/contracts/types/RouterParameters.sol";
import {HyperlaneDeployParams, DeployParams} from "../Structs.sol";

library DeployGoerli {
    uint256 constant chainId = 5;
    bytes32 constant BYTES32_ZERO = bytes32(0);
    address constant UNSUPPORTED_PROTOCOL = address(0);

    function getParams() internal pure returns (DeployParams memory params) {
        RouterParameters memory uniswap = RouterParameters({
            permit2: 0x000000000022D473030F116dDEE9F6B43aC78BA3,
            weth9: 0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6,
            v2Factory: 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f,
            v3Factory: 0x1F98431c8aD98523631AE4a59f267346ea31F984,
            pairInitCodeHash: 0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f,
            poolInitCodeHash: 0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54,
            v4PoolManager: UNSUPPORTED_PROTOCOL,
            v3NFTPositionManager: UNSUPPORTED_PROTOCOL,
            v4PositionManager: UNSUPPORTED_PROTOCOL
        });

        HyperlaneDeployParams memory hyperlane = HyperlaneDeployParams({mailbox: address(0)});

        params = DeployParams({uniswap: uniswap, hyperlane: hyperlane});
    }
}
