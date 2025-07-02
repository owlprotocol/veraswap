// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import "forge-std/console2.sol";

// WETH9
import {WETHUtils} from "../../script/utils/WETHUtils.sol";
// Uniswap V4 Core
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
// Uniswap V4 Periphery
import {IV4MetaQuoter} from "../../contracts/uniswap/IV4MetaQuoter.sol";
// Uniswap Universal Router
import {IUniversalRouter} from "@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol";
// Liquidity Pools
import {LocalTokens, LocalTokensLibrary} from "../../script/libraries/LocalTokens.sol";
import {ContractsUniswapLibrary} from "../../script/libraries/ContractsUniswap.sol";
import {UniswapContracts} from "../../script/Structs.sol";

contract MetaQuoterBaseTest is Test {
    using LocalTokensLibrary for LocalTokens;

    uint128 constant amount = 0.01 ether;

    LocalTokens internal tokens;
    // Liquid tokens
    // eth/weth: Has V3 and V4 pools with all tokens
    // liq34: Has V3 and V4 pools with all tokens
    // liq2: Has V2 pools with all tokens
    // liq3: Has V3 pools with all tokens
    // liq4: Has V4 pools with all tokens
    Currency internal constant eth = Currency.wrap(address(0));
    Currency internal weth9;
    Currency internal liq34;
    Currency internal liq2;
    Currency internal liq3;
    Currency internal liq4;
    Currency internal tokenA;
    Currency internal tokenB;

    UniswapContracts internal contracts;
    IV4MetaQuoter internal metaQuoter;
    IUniversalRouter internal router;

    function setUp() public virtual {
        // Sets proper address for Create2 & transaction sender
        vm.startBroadcast();
        // WETH9
        // Set weth9 code to Optimism pre-deploy for anvil local chains that don't have pre-deploy (used by Uniswap V3)
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
        router = IUniversalRouter(contracts.universalRouter);
        metaQuoter = IV4MetaQuoter(contracts.metaQuoter);

        tokens.permit2Approve(contracts.universalRouter);
    }

    function getDefaultPoolKeyOptions()
        internal
        pure
        returns (IV4MetaQuoter.PoolKeyOptions[] memory defaultPoolKeyOptions)
    {
        defaultPoolKeyOptions = new IV4MetaQuoter.PoolKeyOptions[](4);
        defaultPoolKeyOptions[0] = IV4MetaQuoter.PoolKeyOptions({fee: 100, tickSpacing: 1, hooks: address(0)});
        defaultPoolKeyOptions[1] = IV4MetaQuoter.PoolKeyOptions({fee: 500, tickSpacing: 10, hooks: address(0)});
        defaultPoolKeyOptions[2] = IV4MetaQuoter.PoolKeyOptions({fee: 3_000, tickSpacing: 60, hooks: address(0)});
        defaultPoolKeyOptions[3] = IV4MetaQuoter.PoolKeyOptions({fee: 10_000, tickSpacing: 200, hooks: address(0)});
    }
}
