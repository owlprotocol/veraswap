// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";

// WETH9
import {WETHUtils} from "../script/utils/WETHUtils.sol";
// Uniswap V2 Core
import {IUniswapV2Factory} from "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
// Uniswap V3 Core
import {IUniswapV3Factory} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import {V3PositionManagerMock} from "../contracts/uniswap/v3/V3PositionManagerMock.sol";
// Uniswap V4 Core
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
// Uniswap V4 Periphery
import {IPositionManager} from "@uniswap/v4-periphery/src/interfaces/IPositionManager.sol";
import {IV4MetaQuoter} from "../contracts/uniswap/IV4MetaQuoter.sol";
// Uniswap Universal Router
import {IUniversalRouter} from "@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol";
// Liquidity Pools
import {LocalTokens, LocalTokensLibrary} from "../script/libraries/LocalTokens.sol";
import {ContractsUniswapLibrary} from "../script/libraries/ContractsUniswap.sol";
import {UniswapContracts} from "../script/Structs.sol";

contract UniswapBaseTest is Test {
    using LocalTokensLibrary for LocalTokens;
    LocalTokens internal tokens;

    Currency internal constant eth = Currency.wrap(address(0));
    Currency internal weth9;
    Currency internal liq34;
    Currency internal liq2;
    Currency internal liq3;
    Currency internal liq4;
    Currency internal tokenA;
    Currency internal tokenB;

    UniswapContracts internal contracts;
    IUniswapV2Factory internal v2Factory;
    IUniswapV3Factory internal v3Factory;
    V3PositionManagerMock internal v3PositionManager;
    IPositionManager internal v4PositionManager;

    IUniversalRouter internal router;
    IV4MetaQuoter internal metaQuoter;

    function setUp() public virtual {
        // Sets proper address for Create2 & transaction sender
        vm.startBroadcast();
        // WETH9
        // Set weth9 code to Optimism pre-deploy for anvil local chains that don't have pre-deploy (used by Uniswap V2/V3)
        (address _weth9, ) = WETHUtils.getOrEtch(WETHUtils.opStackPreDeploy);
        tokens = LocalTokensLibrary.deploy(_weth9);

        // Tokens
        weth9 = Currency.wrap(address(tokens.weth9));
        liq34 = Currency.wrap(address(tokens.liq34));
        liq2 = Currency.wrap(address(tokens.liq2));
        liq3 = Currency.wrap(address(tokens.liq3));
        liq4 = Currency.wrap(address(tokens.liq4));

        tokenA = Currency.wrap(address(tokens.tokenA));
        tokenB = Currency.wrap(address(tokens.tokenB));

        contracts = ContractsUniswapLibrary.deploy(_weth9);
        // Uniswap V2 Factory
        v2Factory = IUniswapV2Factory(contracts.v2Factory);
        // Uniswap V3 Factory
        v3Factory = IUniswapV3Factory(contracts.v3Factory);
        v3PositionManager = V3PositionManagerMock(contracts.v3NFTPositionManager);
        // Uniswap V4 Position Manager
        v4PositionManager = IPositionManager(contracts.v4PositionManager);
        // Universal Router
        router = IUniversalRouter(contracts.universalRouter);
        metaQuoter = IV4MetaQuoter(contracts.metaQuoter);

        tokens.permit2Approve(contracts.universalRouter);
    }
}
