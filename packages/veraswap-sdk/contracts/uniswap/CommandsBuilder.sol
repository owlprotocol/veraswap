// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Uniswap V4 Core
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
// Uniswap V4 Periphery
import {Actions} from "@uniswap/v4-periphery/src/libraries/Actions.sol";
import {ActionConstants} from "@uniswap/v4-periphery/src/libraries/ActionConstants.sol";
import {PathKey} from "@uniswap/v4-periphery/src/libraries/PathKey.sol";
import {IV4Router} from "@uniswap/v4-periphery/src/interfaces/IV4Router.sol";
import {IV4MetaQuoter} from "../../contracts/uniswap/IV4MetaQuoter.sol";
// Uniswap Universal Router
import {Commands} from "@uniswap/universal-router/contracts/libraries/Commands.sol";

/// @dev Build Universal Router commands for swapping across Uniswap v2/v3/v4 using Universal Router
library CommandsBuilderLibrary {
    error InvalidProtocolVersion(uint256 version, uint256 expected);
    error InvalidPathOutput(Currency pathLast, Currency currencyOut);

    /// @dev Struct to hold commands, and other cache fields that are updated as we build the commands
    struct CommandsBuilder {
        // Path grouping
        Currency currCurrencyIn;
        uint256 currProtocolVersion;
        uint256 currPathLen;
        PathKey[] currPath;
        // Commands
        uint256 commandsLen;
        uint8[] commands;
        bytes[] commandInputs;
    }

    function buildV2Swap(
        CommandsBuilder memory builder,
        Currency weth,
        Currency currencyOut,
        uint256 amountIn,
        uint256 amountOutMinimum,
        address recipient,
        bool isLastSwap
    ) internal pure {
        if (builder.currProtocolVersion != 2) {
            revert InvalidProtocolVersion(builder.currProtocolVersion, 2);
        }
        // Input: wrap if needed
        if (builder.currCurrencyIn.isAddressZero()) {
            // Wrap native token
            builder.commands[builder.commandsLen] = uint8(Commands.WRAP_ETH);
            builder.commandInputs[builder.commandsLen] = abi.encode(
                ActionConstants.ADDRESS_THIS,
                ActionConstants.CONTRACT_BALANCE
            );
            builder.commandsLen++;
        }
        // Swap
        Currency currencyIn = builder.currCurrencyIn.isAddressZero() ? weth : builder.currCurrencyIn; // currencyIn: if address(0) use weth
        Currency[] memory swapPath = new Currency[](builder.currPathLen + 1);
        swapPath[0] = currencyIn;
        for (uint j = 0; j < builder.currPathLen; j++) {
            swapPath[j + 1] = builder.currPath[j].intermediateCurrency;
        }
        bytes memory swap = abi.encode(
            isLastSwap && !currencyOut.isAddressZero() ? recipient : ActionConstants.ADDRESS_THIS, // recipient: if last swap & no unwrap
            builder.commandsLen == 0 ? amountIn : ActionConstants.CONTRACT_BALANCE, // amountIn: if first command
            isLastSwap ? amountOutMinimum : 0, // amountOutMinimum: if last path
            swapPath,
            builder.commandsLen == 0 // payerIsUser: if first command
        );
        builder.commands[builder.commandsLen] = uint8(Commands.V2_SWAP_EXACT_IN);
        builder.commandInputs[builder.commandsLen] = swap;
        builder.commandsLen++;
        // Output: unwrap if needed
        if (isLastSwap && currencyOut.isAddressZero()) {
            // If last path, unwrap native token
            builder.commands[builder.commandsLen] = uint8(Commands.UNWRAP_WETH);
            builder.commandInputs[builder.commandsLen] = abi.encode(recipient, amountOutMinimum);
            builder.commandsLen++;
        }

        // Reset Variables
        builder.currCurrencyIn = builder.currPath[builder.currPathLen - 1].intermediateCurrency; // Update input currency to last path currency
        builder.currPathLen = 0; // Reset currPath
    }

    function buildV3Swap(
        CommandsBuilder memory builder,
        Currency weth,
        Currency currencyOut,
        uint256 amountIn,
        uint256 amountOutMinimum,
        address recipient,
        bool isLastSwap
    ) internal pure {
        if (builder.currProtocolVersion != 3) {
            revert InvalidProtocolVersion(builder.currProtocolVersion, 3);
        }
        // Input: wrap if needed
        if (builder.currCurrencyIn.isAddressZero()) {
            // Wrap native token
            builder.commands[builder.commandsLen] = uint8(Commands.WRAP_ETH);
            builder.commandInputs[builder.commandsLen] = abi.encode(
                ActionConstants.ADDRESS_THIS,
                ActionConstants.CONTRACT_BALANCE
            );
            builder.commandsLen++;
        }
        // Swap
        Currency currencyIn = builder.currCurrencyIn.isAddressZero() ? weth : builder.currCurrencyIn; // currencyIn: if address(0) use weth
        bytes memory swapPath = abi.encodePacked(currencyIn);
        for (uint j = 0; j < builder.currPathLen; j++) {
            // Could be optimized by using inline assembly to avoid recursive concatenation
            swapPath = bytes.concat(
                swapPath,
                abi.encodePacked(builder.currPath[j].fee, builder.currPath[j].intermediateCurrency)
            );
        }
        bytes memory swap = abi.encode(
            isLastSwap && !currencyOut.isAddressZero() ? recipient : ActionConstants.ADDRESS_THIS, // recipient: if last swap & no unwrap
            builder.commandsLen == 0 ? amountIn : ActionConstants.CONTRACT_BALANCE, // amountIn: if first command
            isLastSwap ? amountOutMinimum : 0, // amountOutMinimum: if last path
            swapPath,
            builder.commandsLen == 0 // payerIsUser: if first command
        );
        builder.commands[builder.commandsLen] = uint8(Commands.V3_SWAP_EXACT_IN);
        builder.commandInputs[builder.commandsLen] = swap;
        builder.commandsLen++;
        // Output: unwrap if needed
        if (isLastSwap && currencyOut.isAddressZero()) {
            // If last path, unwrap native token
            builder.commands[builder.commandsLen] = uint8(Commands.UNWRAP_WETH);
            builder.commandInputs[builder.commandsLen] = abi.encode(recipient, amountOutMinimum);
            builder.commandsLen++;
        }

        // Reset Variables
        builder.currCurrencyIn = builder.currPath[builder.currPathLen - 1].intermediateCurrency; // Update input currency to last path currency
        builder.currPathLen = 0; // Reset currPath
    }

    function buildV4Swap(
        CommandsBuilder memory builder,
        Currency weth,
        Currency currencyOut,
        uint256 amountIn,
        uint256 amountOutMinimum,
        address recipient,
        bool isLastSwap
    ) internal pure {
        if (builder.currProtocolVersion != 4) {
            revert InvalidProtocolVersion(builder.currProtocolVersion, 4);
        }
        // Input: unwrap if needed
        if (builder.currCurrencyIn == weth) {
            // Unwrap weth
            builder.commands[builder.commandsLen] = uint8(Commands.UNWRAP_WETH);
            builder.commandInputs[builder.commandsLen] = abi.encode(
                ActionConstants.ADDRESS_THIS,
                builder.commandsLen == 0 ? amountIn : 0 // amountIn: if first command
            );
            builder.commandsLen++;
        }
        // Swap
        Currency currencyIn = builder.currCurrencyIn == weth ? Currency.wrap(address(0)) : builder.currCurrencyIn; // currencyIn: if weth use address(0)
        bytes memory v4Actions;
        bytes[] memory v4ActionParams = new bytes[](3);
        v4Actions = abi.encodePacked(
            uint8(Actions.SETTLE), // Settle input
            builder.currPathLen > 1 ? uint8(Actions.SWAP_EXACT_IN) : uint8(Actions.SWAP_EXACT_IN_SINGLE), // Swap
            uint8(Actions.TAKE) // Take output
        );
        // Settle: Open delta for currencyIn
        v4ActionParams[0] = abi.encode(
            currencyIn,
            builder.commandsLen == 0 ? uint128(amountIn) : ActionConstants.CONTRACT_BALANCE, // amountIn: if first command
            builder.commandsLen == 0 // payerIsUser: if first command
        );
        // Swap: if single swap use ExactInputSingleParams, else use ExactInputParams
        if (builder.currPathLen > 1) {
            PathKey[] memory path = new PathKey[](builder.currPathLen);
            for (uint i = 0; i < builder.currPathLen; i++) {
                path[i] = builder.currPath[i];
            }

            v4ActionParams[1] = abi.encode(
                IV4Router.ExactInputParams({
                    currencyIn: currencyIn,
                    path: path,
                    amountIn: builder.commandsLen == 0 ? uint128(amountIn) : ActionConstants.OPEN_DELTA, // amountIn: if first command
                    amountOutMinimum: isLastSwap ? uint128(amountOutMinimum) : 0 // amountOutMinimum: if last swap
                })
            );
        } else {
            PathKey memory pathKey = builder.currPath[0];
            (Currency currency0, Currency currency1) = currencyIn < pathKey.intermediateCurrency
                ? (currencyIn, pathKey.intermediateCurrency)
                : (pathKey.intermediateCurrency, currencyIn);

            PoolKey memory poolKey = PoolKey(currency0, currency1, pathKey.fee, pathKey.tickSpacing, pathKey.hooks);
            bool zeroForOne = currencyIn == currency0;

            v4ActionParams[1] = abi.encode(
                IV4Router.ExactInputSingleParams({
                    poolKey: poolKey,
                    zeroForOne: zeroForOne,
                    amountIn: builder.commandsLen == 0 ? uint128(amountIn) : ActionConstants.OPEN_DELTA, // amountIn: if first command
                    amountOutMinimum: isLastSwap ? uint128(amountOutMinimum) : 0, // amountOutMinimum: if last swap
                    hookData: pathKey.hookData
                })
            );
        }

        // Take: Take output currency
        // TODO: BUG Reproduce!!! ( A - B in UI) (end v4???)
        Currency pathOut = builder.currPath[builder.currPathLen - 1].intermediateCurrency; // last currency of current path
        v4ActionParams[2] = abi.encode(
            pathOut,
            (isLastSwap && !(currencyOut == weth)) ? recipient : ActionConstants.ADDRESS_THIS, // recipient: if last swap & no wrap
            isLastSwap ? uint128(amountOutMinimum) : ActionConstants.OPEN_DELTA // amountOutMinimum: if last swap
        );

        bytes memory swap = abi.encode(v4Actions, v4ActionParams);
        builder.commands[builder.commandsLen] = uint8(Commands.V4_SWAP);
        builder.commandInputs[builder.commandsLen] = swap;
        builder.commandsLen++;
        // Output: wrap if needed
        if (isLastSwap && currencyOut == weth) {
            // If last path, wrap native token
            builder.commands[builder.commandsLen] = uint8(Commands.WRAP_ETH);
            builder.commandInputs[builder.commandsLen] = abi.encode(recipient, ActionConstants.CONTRACT_BALANCE);
            builder.commandsLen++;
        }

        // Reset Variables
        builder.currCurrencyIn = pathOut; // Update input currency to last path currency
        builder.currPathLen = 0; // Reset currPath
    }

    /**
     * @notice Builds a list of commands for an exact input swap and handles native token wrapping/unwrapping
     * @dev This algorithm handles various edge cases for building commands for Uniswap v2/v3/v4 swaps.
     *     Here is a high-level overview of the logic:
     *     - Input: currencyIn + list of path keys to swap (hook used to determine protocol version, assumes intermediateCurrency is supported in that protocol version)
     *     - Loop through path keys, keep track of the contiuous protocol version
     *     - When the protocol version changes / we reach the end, build a swap command for the appropriate version
     *     - payerIsUser depends of if this is the first command (true, else false)
     *     - receiver depends of if this is the last swap (input receiver, else ADDRESS_THIS)
     *     - WETH/ETH wrap/unwrap for swap input depends on cached currencyIn and if it is unsuitable for this protocol version
     *     - WETH/ETH wrap/unwrap for swap output depends if this is last swap & user wants the alternative representation (hence why the additional currencyOut param even though this is also in general same as last pathKey)
     * @param weth currency used for wrapping/unwraping native tokens ERC20
     * @param currencyIn input currency for the swap (used to check input wrap/unwrap)
     * @param currencyOut output currency for the swap (used to check output wrap/unwrap)
     * @param path the path to use for the swap, input currency is ignored, hook address is also used as a flag for v2/v3 (address(2)/address(3))
     * @param amountIn amount of input tokens to swap
     * @param amountOutMinimum minimum amount of output tokens to receive
     * @param recipient final recipient of the output tokens
     **/
    function getSwapExactInCommands(
        Currency weth,
        Currency currencyIn,
        Currency currencyOut,
        PathKey[] memory path,
        uint256 amountIn,
        uint256 amountOutMinimum,
        address recipient
    ) internal pure returns (bytes memory commands, bytes[] memory commandInputs) {
        // Check pathOut == currencyOut (or WETH/ETH)
        Currency pathOut = path[path.length - 1].intermediateCurrency;
        if (!(pathOut == currencyOut)) {
            // Check WETH/ETH acceptable for currencyOut/pathOut
            if (
                !((pathOut.isAddressZero() && currencyOut == weth) || (pathOut == weth && currencyOut.isAddressZero()))
            ) {
                revert InvalidPathOutput(pathOut, currencyOut);
            }
        }

        CommandsBuilder memory builder;
        // Params
        builder.currCurrencyIn = currencyIn;
        // Path grouping
        builder.currProtocolVersion = address(path[0].hooks) == address(2)
            ? 2 // V2
            : address(path[0].hooks) == address(3)
                ? 3 // V3
                : 4; // V4, Initialize with first path version
        builder.currPath = new PathKey[](path.length); // Initialize with path length
        // Commands
        builder.commands = new uint8[](2 * path.length + 1); // upper-bound assumes wrap/unwrap between each swap
        builder.commandInputs = new bytes[](2 * path.length + 1);

        // Loop through path
        for (uint i = 0; i < path.length; i++) {
            bool isLastPathKey = i == path.length - 1; // Check if last path key
            uint256 protocolVersion = address(path[i].hooks) == address(2)
                ? 2 // V2
                : address(path[i].hooks) == address(3)
                    ? 3 // V3
                    : 4; // V4

            if (protocolVersion != builder.currProtocolVersion) {
                // Protocol version change: build swap & update current protocol version
                if (builder.currProtocolVersion == 2) {
                    buildV2Swap(builder, weth, currencyOut, amountIn, amountOutMinimum, recipient, false);
                    builder.currProtocolVersion = protocolVersion;
                } else if (builder.currProtocolVersion == 3) {
                    buildV3Swap(builder, weth, currencyOut, amountIn, amountOutMinimum, recipient, false);
                    builder.currProtocolVersion = protocolVersion;
                } else {
                    buildV4Swap(builder, weth, currencyOut, amountIn, amountOutMinimum, recipient, false);
                    builder.currProtocolVersion = protocolVersion;
                }
            }

            // Create or extend current path
            builder.currPath[builder.currPathLen] = path[i];
            builder.currPathLen++;

            if (isLastPathKey) {
                // Last path key: build final swap command
                if (protocolVersion == 2) {
                    buildV2Swap(builder, weth, currencyOut, amountIn, amountOutMinimum, recipient, true);
                } else if (protocolVersion == 3) {
                    buildV3Swap(builder, weth, currencyOut, amountIn, amountOutMinimum, recipient, true);
                } else {
                    buildV4Swap(builder, weth, currencyOut, amountIn, amountOutMinimum, recipient, true);
                }
            }
        }

        // Return commands and inputs
        commands = new bytes(builder.commandsLen);
        commandInputs = new bytes[](builder.commandsLen);
        for (uint i = 0; i < builder.commandsLen; i++) {
            commands[i] = bytes1(builder.commands[i]);
            commandInputs[i] = builder.commandInputs[i];
        }
    }
}
