// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {UniswapContracts, HyperlaneDeployParams, DeployParams} from "../Structs.sol";

library DeployBaseSepolia {
    uint256 constant chainId = 84532;

    function getParams() internal pure returns (DeployParams memory params) {
        UniswapContracts memory uniswap = UniswapContracts({
            permit2: 0x000000000022D473030F116dDEE9F6B43aC78BA3,
            weth9: 0x4200000000000000000000000000000000000006,
            v2Factory: 0x7Ae58f10f7849cA6F5fB71b7f45CB416c9204b1e,
            v3Factory: 0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24,
            pairInitCodeHash: 0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f,
            poolInitCodeHash: 0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54,
            v4PoolManager: 0xf7F5aB3DcA35e17dE187b459159BC643853B3c67,
            v3NFTPositionManager: 0x27F971cb582BF9E50F397e4d29a5C7A34f11faA2,
            v4PositionManager: 0x0B32f74f8365d535783949E014B7754047B64e31,
            v3Quoter: address(0),
            v4StateView: address(0),
            v4Quoter: address(0),
            metaQuoter: address(0),
            universalRouter: address(0)
        });

        HyperlaneDeployParams memory hyperlane = HyperlaneDeployParams({
            mailbox: 0x6966b0E55883d49BFB24539356a2f8A673E02039
        });

        params = DeployParams({uniswap: uniswap, hyperlane: hyperlane});
    }
}
