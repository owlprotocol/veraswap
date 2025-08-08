// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {UniswapContracts, HyperlaneDeployParams, DeployParams} from "../Structs.sol";

library DeployAppchainTestnet {
    uint256 constant chainId = 4661;
    bytes32 constant BYTES32_ZERO = bytes32(0);
    address constant UNSUPPORTED_PROTOCOL = address(0);

    function getParams() internal pure returns (DeployParams memory params) {
        UniswapContracts memory uniswap = UniswapContracts({
            permit2: 0x000000000022D473030F116dDEE9F6B43aC78BA3,
            weth9: 0xe73288389c6caC87aa14E9B35e8e2b3be7fB06C3,
            v2Factory: UNSUPPORTED_PROTOCOL,
            v3Factory: UNSUPPORTED_PROTOCOL,
            pairInitCodeHash: BYTES32_ZERO,
            poolInitCodeHash: BYTES32_ZERO,
            v4PoolManager: 0x4e8C56BeC0907f8e70E2341fF28fcfD8589E3a2d,
            v3NFTPositionManager: address(0),
            v4PositionManager: 0x63D91b09DD0e27C672228E52bCF4Ec08E694c0cB,
            v3Quoter: address(0),
            v4StateView: address(0),
            v4Quoter: address(0),
            metaQuoter: address(0),
            universalRouter: address(0)
        });

        HyperlaneDeployParams memory hyperlane =
            HyperlaneDeployParams({mailbox: 0x4C58973d0Eb3CeB8aBfd933A1C6EE6f8EA178064});

        params = DeployParams({uniswap: uniswap, hyperlane: hyperlane});
    }
}
