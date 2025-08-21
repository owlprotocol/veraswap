// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";

// ERC20
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
// Permit2
import {Permit2Utils} from "../script/utils/Permit2Utils.sol";
// WETH9
import {WETH} from "solmate/src/tokens/WETH.sol";
import {WETHUtils} from "../script/utils/WETHUtils.sol";
// Uniswap V2 Core
import {IUniswapV2Factory} from "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import {V2PoolKey, V2PoolKeyLibrary} from "../contracts/uniswap/v2/V2PoolKey.sol";
// Uniswap V2 Periphery
import {IV2Quoter} from "../contracts/uniswap/v2/IV2Quoter.sol";
import {V2QuoterUtils} from "../script/utils/V2QuoterUtils.sol";
// Uniswap V4 Core
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
// Uniswap V4 Periphery
import {ActionConstants} from "@uniswap/v4-periphery/src/libraries/ActionConstants.sol";
// Uniswap Universal Router
import {IUniversalRouter} from "@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol";
import {Commands} from "@uniswap/universal-router/contracts/libraries/Commands.sol";
// Liquidity Pools
import {LocalTokens, LocalTokensLibrary} from "../script/libraries/LocalTokens.sol";
import {LocalPoolsLibrary, LocalV2Pools} from "../script/libraries/LocalPools.sol";
import {ContractsUniswapLibrary} from "../script/libraries/ContractsUniswap.sol";
import {UniswapContracts} from "../script/Structs.sol";

import {MockAgentToken} from "../contracts/agent-token/MockAgentToken.sol";

contract V2QuoterTest is Test {
    using LocalTokensLibrary for LocalTokens;

    uint128 constant amount = 0.01 ether;

    // Tokens
    Currency internal constant eth = Currency.wrap(address(0));
    Currency internal weth9;
    Currency internal liq34;
    Currency internal liq2;
    Currency internal liq3;
    Currency internal liq4;
    Currency internal tokenA;
    Currency internal tokenB;
    Currency internal tokenAgent;

    // Uniswap Contracts
    UniswapContracts internal contracts;
    // Uniswap V2
    IV2Quoter internal v2Quoter;
    LocalV2Pools v2Pools;
    // Uniswap Universal Router
    IUniversalRouter internal router;

    function setUp() public {
        // Sets proper address for Create2 & transaction sender
        vm.startBroadcast();

        // WETH9
        // Set weth9 code to Optimism pre-deploy for anvil local chains that don't have pre-deploy (used by Uniswap V3)
        (address _weth9,) = WETHUtils.getOrEtch(WETHUtils.opStackPreDeploy);
        LocalTokens memory tokens = LocalTokensLibrary.deploy(_weth9);
        // Tokens
        weth9 = Currency.wrap(address(tokens.weth9));
        liq34 = Currency.wrap(address(tokens.liq34));
        liq2 = Currency.wrap(address(tokens.liq2));
        liq3 = Currency.wrap(address(tokens.liq3));
        liq4 = Currency.wrap(address(tokens.liq4));
        tokenA = Currency.wrap(address(tokens.tokenA));
        tokenB = Currency.wrap(address(tokens.tokenB));
        tokenAgent = Currency.wrap(address(tokens.tokenAgent));

        // Uniswap Contracts
        contracts = ContractsUniswapLibrary.deploy(_weth9);
        router = IUniversalRouter(contracts.universalRouter);
        tokens.permit2Approve(contracts.universalRouter);
        // Uniswap V2
        (address _v2Quoter,) = V2QuoterUtils.getOrCreate2(contracts.v2Factory, contracts.pairInitCodeHash);
        v2Quoter = IV2Quoter(_v2Quoter);
        v2Pools = LocalPoolsLibrary.deployV2Pools(IUniswapV2Factory(contracts.v2Factory), tokens);
    }

    function testExactInputSingle_A_L2() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (tokenA, liq2);
        // PoolKey
        (Currency currency0, Currency currency1) =
            currencyIn < currencyOut ? (currencyIn, currencyOut) : (currencyOut, currencyIn);
        V2PoolKey memory poolKey = V2PoolKey({currency0: currency0, currency1: currency1});

        // V2 Quote
        bool zeroForOne = currency0 == currencyIn;
        IV2Quoter.QuoteExactSingleParams memory quoteParams =
            IV2Quoter.QuoteExactSingleParams({poolKey: poolKey, exactAmount: amount, zeroForOne: zeroForOne});
        uint256 amountOut = v2Quoter.quoteExactInputSingle(quoteParams);

        // V2 Swap
        // Encode V2 Swap
        address[] memory path = new address[](2);
        path[0] = Currency.unwrap(currencyIn);
        path[1] = Currency.unwrap(currencyOut);

        bytes memory v2Swap = abi.encode(
            ActionConstants.MSG_SENDER, // recipient
            amount,
            amountOut, // amountOutMinimum
            path,
            true // payerIsUser
        );
        // Encode Universal Router Commands
        bytes memory routerCommands = abi.encodePacked(uint8(Commands.V2_SWAP_EXACT_IN));
        bytes[] memory routerCommandInputs = new bytes[](1);
        routerCommandInputs[0] = v2Swap;
        // Execute Swap
        uint256 currencyInBalanceBeforeSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceBeforeSwap = currencyOut.balanceOf(msg.sender);
        uint256 deadline = block.timestamp + 20;
        router.execute(routerCommands, routerCommandInputs, deadline);
        uint256 currencyInBalanceAfterSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceAfterSwap = currencyOut.balanceOf(msg.sender);
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - quoteParams.exactAmount); // Input balance decreased by exact amount
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + amountOut); // Output balance increased by variable amount
    }

    // Test buying a token with tax
    function testExactInputSingle_L2_Agent() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (liq2, tokenAgent);
        // PoolKey
        (Currency currency0, Currency currency1) =
            currencyIn < currencyOut ? (currencyIn, currencyOut) : (currencyOut, currencyIn);
        V2PoolKey memory poolKey = V2PoolKey({currency0: currency0, currency1: currency1});

        assertTrue(MockAgentToken(Currency.unwrap(tokenAgent)).isLiquidityPool(address(v2Pools.liq2_tokenAgent)));

        // V2 Quote
        bool zeroForOne = currency0 == currencyIn;
        IV2Quoter.QuoteExactSingleParams memory quoteParams =
            IV2Quoter.QuoteExactSingleParams({poolKey: poolKey, exactAmount: amount, zeroForOne: zeroForOne});
        uint256 amountOut = v2Quoter.quoteExactInputSingle(quoteParams);

        // V2 Swap
        // Encode V2 Swap
        address[] memory path = new address[](2);
        path[0] = Currency.unwrap(currencyIn);
        path[1] = Currency.unwrap(currencyOut);

        uint256 BP_DENOM = 10_000;
        uint256 totalBuyTaxBasisPoints = MockAgentToken(Currency.unwrap(tokenAgent)).totalBuyTaxBasisPoints();
        assertEq(totalBuyTaxBasisPoints, 100); // 1% tax

        uint256 amountOutExcludingTax = amountOut - ((amountOut * totalBuyTaxBasisPoints) / BP_DENOM);

        bytes memory v2Swap = abi.encode(
            ActionConstants.MSG_SENDER, // recipient
            amount,
            // NOTE: when buying a token with tax, we need to specify the amountOut excluding tax
            amountOutExcludingTax,
            path,
            true // payerIsUser
        );
        // Encode Universal Router Commands
        bytes memory routerCommands = abi.encodePacked(uint8(Commands.V2_SWAP_EXACT_IN));
        bytes[] memory routerCommandInputs = new bytes[](1);
        routerCommandInputs[0] = v2Swap;
        // Execute Swap
        uint256 currencyInBalanceBeforeSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceBeforeSwap = currencyOut.balanceOf(msg.sender);
        uint256 deadline = block.timestamp + 20;
        router.execute(routerCommands, routerCommandInputs, deadline);
        uint256 currencyInBalanceAfterSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceAfterSwap = currencyOut.balanceOf(msg.sender);
        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - quoteParams.exactAmount); // Input balance decreased by exact amount
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + amountOutExcludingTax); // Output balance increased by variable amount
    }

    // Test selling a token with tax
    function testExactInputSingle_Agent_L2() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (tokenAgent, liq2);
        // PoolKey
        (Currency currency0, Currency currency1) =
            currencyIn < currencyOut ? (currencyIn, currencyOut) : (currencyOut, currencyIn);
        V2PoolKey memory poolKey = V2PoolKey({currency0: currency0, currency1: currency1});

        assertTrue(MockAgentToken(Currency.unwrap(tokenAgent)).isLiquidityPool(address(v2Pools.liq2_tokenAgent)));

        uint256 BP_DENOM = 10_000;
        uint256 totalSellTaxBasisPoints = MockAgentToken(Currency.unwrap(tokenAgent)).totalSellTaxBasisPoints();
        assertEq(totalSellTaxBasisPoints, 100); // 1% tax
        uint256 amountInTax = (amount * totalSellTaxBasisPoints) / BP_DENOM;

        uint128 amountInMinusTax = amount - uint128(amountInTax);

        // V2 Quote
        bool zeroForOne = currency0 == currencyIn;
        IV2Quoter.QuoteExactSingleParams memory quoteParams =
        // NOTE: when selling a token with tax, we need to specify the amountIn excluding tax
         IV2Quoter.QuoteExactSingleParams({poolKey: poolKey, exactAmount: amountInMinusTax, zeroForOne: zeroForOne});
        uint256 amountOut = v2Quoter.quoteExactInputSingle(quoteParams);

        // V2 Swap
        // Encode V2 Swap
        address[] memory path = new address[](2);
        path[0] = Currency.unwrap(currencyIn);
        path[1] = Currency.unwrap(currencyOut);

        bytes memory v2Swap = abi.encode(
            ActionConstants.MSG_SENDER, // recipient
            amount,
            amountOut,
            path,
            true // payerIsUser
        );
        // Encode Universal Router Commands
        bytes memory routerCommands = abi.encodePacked(uint8(Commands.V2_SWAP_EXACT_IN));
        bytes[] memory routerCommandInputs = new bytes[](1);
        routerCommandInputs[0] = v2Swap;
        // Execute Swap
        uint256 currencyInBalanceBeforeSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceBeforeSwap = currencyOut.balanceOf(msg.sender);

        // Balance of the contract itself, where tax is collected
        uint256 agentTokenTaxBalanceBeforeSwap = tokenAgent.balanceOf(Currency.unwrap(tokenAgent));

        uint256 deadline = block.timestamp + 20;
        router.execute(routerCommands, routerCommandInputs, deadline);
        uint256 currencyInBalanceAfterSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyOutBalanceAfterSwap = currencyOut.balanceOf(msg.sender);

        assertEq(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap - amount); // Input balance decreased by exact amount
        assertEq(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap + amountOut); // Output balance increased by variable amount

        // Balance of the contract itself, where tax is collected
        // uint256 agentTokenTaxBalanceAfterSwap = tokenAgent.balanceOfSelf();
        uint256 agentTokenTaxBalanceAfterSwap = tokenAgent.balanceOf(Currency.unwrap(tokenAgent));

        assertEq(agentTokenTaxBalanceAfterSwap, agentTokenTaxBalanceBeforeSwap + amountInTax);
    }
}
