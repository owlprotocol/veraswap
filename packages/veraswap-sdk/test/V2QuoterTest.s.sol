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

contract V2QuoterTest is Test {
    using LocalTokensLibrary for LocalTokens;

    uint128 constant amount = 0.01 ether;

    Currency internal constant eth = Currency.wrap(address(0));
    Currency internal weth9;
    Currency internal liq34;
    Currency internal liq2;
    Currency internal liq3;
    Currency internal liq4;
    Currency internal tokenA;
    Currency internal tokenB;

    IUniversalRouter internal router;

    LocalV2Pools pools;

    function setUp() public {
        // Sets proper address for Create2 & transaction sender
        vm.startBroadcast();

        // WETH9
        // Set weth9 code to Optimism pre-deploy for anvil local chains that don't have pre-deploy (used by Uniswap V3)
        (address _weth9, ) = WETHUtils.getOrEtch(WETHUtils.opStackPreDeploy);
        LocalTokens memory tokens = LocalTokensLibrary.deploy(_weth9);
        // Tokens
        weth9 = Currency.wrap(address(tokens.weth9));
        liq34 = Currency.wrap(address(tokens.liq34));
        liq2 = Currency.wrap(address(tokens.liq2));
        liq3 = Currency.wrap(address(tokens.liq3));
        liq4 = Currency.wrap(address(tokens.liq4));
        tokenA = Currency.wrap(address(tokens.tokenA));
        tokenB = Currency.wrap(address(tokens.tokenB));

        // Uniswap Contracts
        UniswapContracts memory contracts = ContractsUniswapLibrary.deploy(_weth9);
        router = IUniversalRouter(contracts.universalRouter);
        tokens.permit2Approve(contracts.universalRouter);

        // Create V2 Pools
        pools = LocalPoolsLibrary.deployV2Pools(IUniswapV2Factory(contracts.v2Factory), tokens);
    }

    function testExactInputSingle_A_L2() public {
        // Currency
        (Currency currencyIn, Currency currencyOut) = (tokenA, liq2);

        // V2 Swap
        // Encode V2 Swap
        // bytes memory path = abi.encodePacked(Currency.unwrap(currencyIn), Currency.unwrap(currencyOut));
        address[] memory path = new address[](2);
        path[0] = Currency.unwrap(currencyIn);
        path[1] = Currency.unwrap(currencyOut);

        bytes memory v2Swap = abi.encode(
            ActionConstants.MSG_SENDER, // recipient
            amount,
            uint256(0), // amountOutMinimum
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
        assertLt(currencyInBalanceAfterSwap, currencyInBalanceBeforeSwap); // Input balance decreased
        assertGt(currencyOutBalanceAfterSwap, currencyOutBalanceBeforeSwap); // Output balance increased
    }
}
