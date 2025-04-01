// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {UniswapContracts, HyperlaneDeployParams, DeployParams} from "../Structs.sol";

library DeployCelo {
    uint256 constant chainId = 42220;
    address constant UNSUPPORTED_PROTOCOL = address(0);

    function getParams() internal pure returns (DeployParams memory params) {
        UniswapContracts memory uniswap = UniswapContracts({
            permit2: 0x000000000022D473030F116dDEE9F6B43aC78BA3,
            weth9: UNSUPPORTED_PROTOCOL,
            v2Factory: 0x79a530c8e2fA8748B7B40dd3629C0520c2cCf03f,
            v3Factory: 0xAfE208a311B21f13EF87E33A90049fC17A7acDEc,
            pairInitCodeHash: 0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f,
            poolInitCodeHash: 0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54,
            v4PoolManager: UNSUPPORTED_PROTOCOL,
            v3NFTPositionManager: 0x3d79EdAaBC0EaB6F08ED885C05Fc0B014290D95A,
            v4PositionManager: UNSUPPORTED_PROTOCOL,
            v4StateView: address(0),
            v4Quoter: address(0),
            universalRouter: address(0)
        });

        HyperlaneDeployParams memory hyperlane = HyperlaneDeployParams({mailbox: address(0)});

        params = DeployParams({uniswap: uniswap, hyperlane: hyperlane});
    }
}
