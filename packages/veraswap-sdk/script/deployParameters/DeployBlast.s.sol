// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {UniswapContracts, HyperlaneDeployParams, DeployParams} from "../Structs.sol";

library DeployBlast {
    uint256 constant chainId = 81457;

    function getParams() internal pure returns (DeployParams memory params) {
        UniswapContracts memory uniswap = UniswapContracts({
            permit2: 0x000000000022D473030F116dDEE9F6B43aC78BA3,
            weth9: 0x4300000000000000000000000000000000000004,
            v2Factory: 0x5C346464d33F90bABaf70dB6388507CC889C1070,
            v3Factory: 0x792edAdE80af5fC680d96a2eD80A44247D2Cf6Fd,
            pairInitCodeHash: 0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f,
            poolInitCodeHash: 0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54,
            v4PoolManager: 0x1631559198A9e474033433b2958daBC135ab6446,
            v3NFTPositionManager: 0xB218e4f7cF0533d4696fDfC419A0023D33345F28,
            v4PositionManager: 0x4AD2F4CcA2682cBB5B950d660dD458a1D3f1bAaD,
            v3Quoter: address(0),
            v4StateView: address(0),
            v4Quoter: address(0),
            metaQuoter: address(0),
            universalRouter: address(0)
        });

        HyperlaneDeployParams memory hyperlane = HyperlaneDeployParams({mailbox: address(0)});

        params = DeployParams({uniswap: uniswap, hyperlane: hyperlane});
    }
}
