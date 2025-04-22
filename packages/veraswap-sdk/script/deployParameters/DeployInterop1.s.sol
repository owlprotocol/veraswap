// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {UniswapContracts, HyperlaneDeployParams, DeployParams} from "../Structs.sol";

library DeployInterop1 {
    uint256 constant chainId = 420120001;

    bytes32 constant BYTES32_ZERO = bytes32(0);
    address constant UNSUPPORTED_PROTOCOL = address(0);

    function getParams() internal pure returns (DeployParams memory params) {
        UniswapContracts memory uniswap = UniswapContracts({
            permit2: 0x000000000022D473030F116dDEE9F6B43aC78BA3,
            weth9: 0x4200000000000000000000000000000000000006,
            v2Factory: UNSUPPORTED_PROTOCOL,
            v3Factory: UNSUPPORTED_PROTOCOL,
            pairInitCodeHash: BYTES32_ZERO,
            poolInitCodeHash: BYTES32_ZERO,
            v4PoolManager: 	0x9131B9084E6017Be19c6a0ef23f73dbB1Bf41f96,
            v3NFTPositionManager: address(0),
            v4PositionManager: 0x4498FE0b1DF6B476453440664A16E269B7587D0F,
            v4StateView: 0xF3c2E547e8da2052E2fC997ee94d54FbE59a6375,
            v4Quoter: 0x7C594D9B533ac43D3595dd4117549111Ec48F8B2,
            universalRouter: 0x4a5C956e6626c552c9e830beFDDf8F5e02bBf60a
        });

        HyperlaneDeployParams memory hyperlane = HyperlaneDeployParams({mailbox: address(0)});

        params = DeployParams({uniswap: uniswap, hyperlane: hyperlane});
    }
}
