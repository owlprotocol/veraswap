// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {UniswapContracts, HyperlaneDeployParams, DeployParams} from "../Structs.sol";

library DeployUnichain {
    uint256 constant chainId = 130;
    bytes32 constant BYTES32_ZERO = bytes32(0);

    function getParams() internal pure returns (DeployParams memory params) {
        UniswapContracts memory uniswap = UniswapContracts({
            permit2: 0x000000000022D473030F116dDEE9F6B43aC78BA3,
            weth9: 0x4200000000000000000000000000000000000006,
            v2Factory: 0x1F98400000000000000000000000000000000002,
            v3Factory: 0x1F98400000000000000000000000000000000003,
            pairInitCodeHash: 0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f,
            poolInitCodeHash: 0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54,
            v4PoolManager: 0x1F98400000000000000000000000000000000004,
            v3NFTPositionManager: 0x943e6e07a7E8E791dAFC44083e54041D743C46E9,
            v4PositionManager: 0x4529A01c7A0410167c5740C487A8DE60232617bf,
            v4StateView: 0x86e8631A016F9068C3f085fAF484Ee3F5fDee8f2,
            v4Quoter: 0x333E3C607B141b18fF6de9f258db6e77fE7491E0,
            universalRouter: 0xEf740bf23aCaE26f6492B10de645D6B98dC8Eaf3
        });

        HyperlaneDeployParams memory hyperlane = HyperlaneDeployParams({mailbox: 0x3a464f746D23Ab22155710f44dB16dcA53e0775E});

        params = DeployParams({uniswap: uniswap, hyperlane: hyperlane});
    }
}
