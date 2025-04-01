// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {UniswapContracts, HyperlaneDeployParams, DeployParams} from "../Structs.sol";

library DeployWorldchain {
    uint256 constant chainId = 480;
    bytes32 constant BYTES32_ZERO = bytes32(0);

    function getParams() internal pure returns (DeployParams memory params) {
        UniswapContracts memory uniswap = UniswapContracts({
            permit2: 0x000000000022D473030F116dDEE9F6B43aC78BA3,
            weth9: 0x4200000000000000000000000000000000000006,
            v2Factory: 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f,
            v3Factory: 0x7a5028BDa40e7B173C278C5342087826455ea25a,
            pairInitCodeHash: 0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f,
            poolInitCodeHash: 0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54,
            v4PoolManager: 0xb1860D529182ac3BC1F51Fa2ABd56662b7D13f33,
            v3NFTPositionManager: 0xec12a9F9a09f50550686363766Cc153D03c27b5e,
            v4PositionManager: 0xC585E0f504613b5fBf874F21Af14c65260fB41fA,
            v4StateView: address(0),
            v4Quoter: address(0),
            universalRouter: address(0)
        });

        HyperlaneDeployParams memory hyperlane = HyperlaneDeployParams({mailbox: address(0)});

        params = DeployParams({uniswap: uniswap, hyperlane: hyperlane});
    }
}
