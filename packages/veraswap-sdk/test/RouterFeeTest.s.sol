// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

// Uniswap V4 Core
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
// Uniswap Universal Router
import {Commands} from "@uniswap/universal-router/contracts/libraries/Commands.sol";
// Base Test
import {UniswapBaseTest} from "./UniswapBaseTest.sol";

contract RouterFeeTest is UniswapBaseTest {
    uint128 constant amountIn = 0.01 ether;

    function setUp() public virtual override {
        super.setUp();
    }

    function test_permit2_transfer_from() public {
        Currency currencyIn = tokenA;

        bytes memory commands = new bytes(1);
        commands[0] = bytes1(uint8(Commands.PERMIT2_TRANSFER_FROM));

        address feeRecipient = address(0xbeef);
        uint256 feeAmount = 10;
        bytes[] memory commandInputs = new bytes[](1);
        commandInputs[0] = abi.encode(currencyIn, feeRecipient, feeAmount);

        uint256 deadline = block.timestamp + 20;

        uint256 currencyInBalanceBeforeSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyInBalanceRecipientBeforeSwap = currencyIn.balanceOf(feeRecipient);
        router.execute(commands, commandInputs, deadline);

        uint256 currencyInBalanceAfterSwap = currencyIn.balanceOf(msg.sender);
        uint256 currencyInBalanceRecipientAfterSwap = currencyIn.balanceOf(feeRecipient);

        assertEq(
            currencyInBalanceBeforeSwap - currencyInBalanceAfterSwap,
            feeAmount,
            "Incorrect balance for sender after fee transfer"
        );
        assertEq(
            currencyInBalanceRecipientAfterSwap - currencyInBalanceRecipientBeforeSwap,
            feeAmount,
            "Incorrect balance for recipient after fee transfer"
        );
    }
}
