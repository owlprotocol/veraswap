// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.24;

import {UniswapContracts, HyperlaneDeployParams, DeployParams} from "../Structs.sol";

library DeployZora {
    uint256 constant chainId = 7777777;
    bytes32 constant BYTES32_ZERO = bytes32(0);

    function getParams() internal pure returns (DeployParams memory params) {
        UniswapContracts memory uniswap = UniswapContracts({
            permit2: 0x000000000022D473030F116dDEE9F6B43aC78BA3,
            weth9: 0x4200000000000000000000000000000000000006,
            v2Factory: 0x0F797dC7efaEA995bB916f268D919d0a1950eE3C,
            v3Factory: 0x7145F8aeef1f6510E92164038E1B6F8cB2c42Cbb,
            pairInitCodeHash: 0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f,
            poolInitCodeHash: 0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54,
            v4PoolManager: 0x0575338e4C17006aE181B47900A84404247CA30f,
            v3NFTPositionManager: 0xbC91e8DfA3fF18De43853372A3d7dfe585137D78,
            v4PositionManager: 0xf66C7b99e2040f0D9b326B3b7c152E9663543D63,
            v4StateView: address(0),
            v4Quoter: address(0),
            universalRouter: address(0)
        });

        HyperlaneDeployParams memory hyperlane = HyperlaneDeployParams({mailbox: address(0)});

        params = DeployParams({uniswap: uniswap, hyperlane: hyperlane});
    }
}
