// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {UniswapContracts, HyperlaneDeployParams, DeployParams} from "../Structs.sol";

library DeploySepolia {
    uint256 constant chainId = 11155111;

    function getParams() internal pure returns (DeployParams memory params) {
        UniswapContracts memory uniswap = UniswapContracts({
            permit2: 0x000000000022D473030F116dDEE9F6B43aC78BA3,
            weth9: 0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14,
            v2Factory: 0xB7f907f7A9eBC822a80BD25E224be42Ce0A698A0,
            v3Factory: 0x0227628f3F023bb0B980b67D528571c95c6DaC1c,
            pairInitCodeHash: 0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f,
            poolInitCodeHash: 0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54,
            v4PoolManager: 0xE03A1074c86CFeDd5C142C4F04F1a1536e203543,
            v3NFTPositionManager: 0x1238536071E1c677A632429e3655c799b22cDA52,
            v4PositionManager: 0x429ba70129df741B2Ca2a85BC3A2a3328e5c09b4,
            v4StateView: 0xE1Dd9c3fA50EDB962E442f60DfBc432e24537E4C,
            v4Quoter: 0x61B3f2011A92d183C7dbaDBdA940a7555Ccf9227,
            universalRouter: address(0)
        });

        HyperlaneDeployParams memory hyperlane = HyperlaneDeployParams({
            mailbox: 0xfFAEF09B3cd11D9b20d1a19bECca54EEC2884766
        });

        params = DeployParams({uniswap: uniswap, hyperlane: hyperlane});
    }
}
