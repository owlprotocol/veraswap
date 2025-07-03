import { Actions, V4Planner } from "@uniswap/v4-sdk";
import { Address, encodePacked, Hex, padHex, zeroAddress } from "viem";

import { PathKey, PoolKey } from "../types/PoolKey.js";

import { ACTION_CONSTANTS, CommandType } from "./routerCommands.js";

const address2 = padHex("0x2", { size: 20 });
const address3 = padHex("0x3", { size: 20 });

/**
 * @dev Struct to hold commands, and other cache fields that are updated as we build the commands
 */
export interface CommandsBuilder {
    // Path grouping
    currCurrencyIn: Address;
    currProtocolVersion: number;
    currPath: PathKey[];
    // Commands
    commands: CommandType[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    commandInputs: any[];
}

/**
 * @dev Parameters for the `buildSwap` functions, `builder` will be mutated
 */
interface BuildSwapParams {
    builder: CommandsBuilder;
    weth: Address;
    currencyOut: Address;
    amountIn: bigint;
    amountOutMinimum: bigint;
    recipient: Address;
    isLastSwap: boolean;
}

function buildV2Swap({
    builder,
    weth,
    currencyOut,
    amountIn,
    amountOutMinimum,
    recipient,
    isLastSwap,
}: BuildSwapParams) {
    if (builder.currProtocolVersion !== 2) {
        throw new Error("InvalidProtocolVersion: Expected version 2");
    }
    // Input: wrap if needed
    if (builder.currCurrencyIn === zeroAddress) {
        // Wrap native token
        builder.commands.push(CommandType.WRAP_ETH);
        builder.commandInputs.push([ACTION_CONSTANTS.ADDRESS_THIS, ACTION_CONSTANTS.CONTRACT_BALANCE]);
    }
    // Swap
    const currencyIn = builder.currCurrencyIn === zeroAddress ? weth : builder.currCurrencyIn;
    const swapPath: Address[] = [];
    swapPath.push(currencyIn);
    for (const pathKey of builder.currPath) {
        swapPath.push(pathKey.intermediateCurrency);
    }
    const swap = [
        isLastSwap ? recipient : ACTION_CONSTANTS.ADDRESS_THIS, // recipient: if last swap & no unwrap
        builder.commands.length == 0 ? amountIn : ACTION_CONSTANTS.CONTRACT_BALANCE, // amountIn: if first command
        isLastSwap ? amountOutMinimum : 0n, // amountOutMinimum: if last path
        swapPath,
        builder.commands.length == 0, // payerIsUser: if first command
    ] as const;
    builder.commands.push(CommandType.V2_SWAP_EXACT_IN);
    builder.commandInputs.push(swap);
    // Output: unwrap if needed
    if (isLastSwap && currencyOut === zeroAddress) {
        builder.commands.push(CommandType.UNWRAP_WETH);
        builder.commandInputs.push([recipient, amountOutMinimum]);
    }

    // Reset Variables
    builder.currCurrencyIn = builder.currPath[builder.currPath.length - 1].intermediateCurrency;
    builder.currPath = [];
}

function buildV3Swap({
    builder,
    weth,
    currencyOut,
    amountIn,
    amountOutMinimum,
    recipient,
    isLastSwap,
}: BuildSwapParams) {
    if (builder.currProtocolVersion !== 3) {
        throw new Error("InvalidProtocolVersion: Expected version 3");
    }
    // Input: wrap if needed
    if (builder.currCurrencyIn === zeroAddress) {
        // Wrap native token
        builder.commands.push(CommandType.WRAP_ETH);
        builder.commandInputs.push([ACTION_CONSTANTS.ADDRESS_THIS, ACTION_CONSTANTS.CONTRACT_BALANCE]);
    }
    // Swap
    const currencyIn = builder.currCurrencyIn === zeroAddress ? weth : builder.currCurrencyIn;
    const swapPathTypes: ("address" | "uint24")[] = ["address"];
    const swapPathValues: (Address | number)[] = [currencyIn];
    for (const pathKey of builder.currPath) {
        swapPathValues.push(pathKey.fee, pathKey.intermediateCurrency);
        swapPathTypes.push("uint24", "address");
    }
    const swapPath: Hex = encodePacked(swapPathTypes, swapPathValues);

    const swap = [
        isLastSwap ? recipient : ACTION_CONSTANTS.ADDRESS_THIS, // recipient: if last swap & no unwrap
        builder.commands.length == 0 ? amountIn : ACTION_CONSTANTS.CONTRACT_BALANCE, // amountIn: if first command
        isLastSwap ? amountOutMinimum : 0n, // amountOutMinimum: if last path
        swapPath,
        builder.commands.length == 0, // payerIsUser: if first command
    ] as const;
    builder.commands.push(CommandType.V3_SWAP_EXACT_IN);
    builder.commandInputs.push(swap);
    // Output: unwrap if needed
    if (isLastSwap && currencyOut === zeroAddress) {
        builder.commands.push(CommandType.UNWRAP_WETH);
        builder.commandInputs.push([recipient, amountOutMinimum]);
    }

    // Reset Variables
    builder.currCurrencyIn = builder.currPath[builder.currPath.length - 1].intermediateCurrency;
    builder.currPath = [];
}

function buildV4Swap({
    builder,
    weth,
    currencyOut,
    amountIn,
    amountOutMinimum,
    recipient,
    isLastSwap,
}: BuildSwapParams) {
    if (builder.currProtocolVersion !== 4) {
        throw new Error("InvalidProtocolVersion: Expected version 4");
    }
    // Input: unwrap if needed
    if (builder.currCurrencyIn === weth) {
        // Unwrap weth
        builder.commands.push(CommandType.UNWRAP_WETH);
        builder.commandInputs.push([ACTION_CONSTANTS.ADDRESS_THIS, builder.commands.length == 0 ? amountIn : 0]); // amountIn: if first command
    }
    // Swap
    const currencyIn = builder.currCurrencyIn === weth ? zeroAddress : builder.currCurrencyIn;
    const v4TradePlan = new V4Planner();
    // Settle: Open delta for currencyIn
    v4TradePlan.addAction(Actions.SETTLE, [
        currencyIn,
        builder.commands.length == 0 ? amountIn : ACTION_CONSTANTS.CONTRACT_BALANCE, // amountIn: if first command
        builder.commands.length == 0, // payerIsUser: if first command
    ]);
    // Swap: if single swap use ExactInputSingleParams, else use ExactInputParams
    if (builder.currPath.length > 1) {
        v4TradePlan.addAction(Actions.SWAP_EXACT_IN, [
            {
                currencyIn,
                path: builder.currPath,
                amountIn: builder.commands.length == 0 ? amountIn : ACTION_CONSTANTS.CONTRACT_BALANCE, // amountIn: if first command
                amountOutMinimum: isLastSwap ? amountOutMinimum : 0n, // amountOutMinimum: if last swap
            },
        ]);
    } else {
        const pathKey = builder.currPath[0];
        const [currency0, currency1] =
            currencyIn < pathKey.intermediateCurrency
                ? [currencyIn, pathKey.intermediateCurrency]
                : [pathKey.intermediateCurrency, currencyIn];
        const poolKey: PoolKey = {
            currency0,
            currency1,
            fee: pathKey.fee,
            tickSpacing: pathKey.tickSpacing,
            hooks: pathKey.hooks,
        };
        const zeroForOne = currencyIn === currency0;

        v4TradePlan.addAction(Actions.SWAP_EXACT_IN_SINGLE, [
            {
                poolKey,
                zeroForOne,
                amountIn: builder.commands.length == 0 ? amountIn : ACTION_CONSTANTS.CONTRACT_BALANCE, // amountIn: if first command
                amountOutMinimum: isLastSwap ? amountOutMinimum : 0n, // amountOutMinimum: if last swap
                hoookData: pathKey.hookData,
            },
        ]);
    }

    // Take: Take output currency
    const pathOut = builder.currPath[builder.currPath.length - 1].intermediateCurrency; // last currency of current path
    if (isLastSwap) {
        // Take All (most often to recipient)
        v4TradePlan.addAction(Actions.TAKE_ALL, [
            pathOut,
            currencyOut != weth ? recipient : ACTION_CONSTANTS.ADDRESS_THIS, // recipient: if last swap & no wrap
            amountOutMinimum, // amountOutMinimum: if last swap
        ]);
    } else {
        // Take (funds received to router)
        v4TradePlan.addAction(Actions.TAKE, [pathOut, ACTION_CONSTANTS.ADDRESS_THIS, ACTION_CONSTANTS.OPEN_DELTA]);
    }

    builder.commands.push(CommandType.V4_SWAP);
    builder.commandInputs.push(v4TradePlan.finalize());

    // Output: wrap if needed
    if (isLastSwap && currencyOut === weth) {
        // If last swap, wrap native token
        builder.commands.push(CommandType.WRAP_ETH);
        builder.commandInputs.push([recipient, ACTION_CONSTANTS.CONTRACT_BALANCE]);
    }

    // Reset Variables
    builder.currCurrencyIn = builder.currPath[builder.currPath.length - 1].intermediateCurrency;
    builder.currPath = [];
}

export interface GetSwapExactInCommandsParams {
    weth: Address;
    currencyIn: Address;
    currencyOut: Address;
    path: PathKey[];
    amountIn: bigint;
    amountOutMinimum: bigint;
    recipient: Address;
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
export function getSwapExactInCommands({
    weth,
    currencyIn,
    currencyOut,
    path,
    amountIn,
    amountOutMinimum,
    recipient,
}: GetSwapExactInCommandsParams) {
    // Check pathOut == currencyOut (or WETH/ETH)
    const pathOut = path[path.length - 1].intermediateCurrency;
    if (!(pathOut == currencyOut)) {
        // Check WETH/ETH acceptable for currencyOut/pathOut
        if (!((pathOut === zeroAddress && currencyOut === weth) || (pathOut === weth && currencyOut === zeroAddress))) {
            throw new Error(`InvalidPathOutput: ${pathOut} != ${currencyOut}`);
        }
    }

    // Initialize builder
    const builder: CommandsBuilder = {
        currCurrencyIn: currencyIn,
        currProtocolVersion: path[0].hooks === address2 ? 2 : path[0].hooks === address3 ? 3 : 4,
        currPath: [],
        commands: [],
        commandInputs: [],
    };

    for (let i = 0; i < path.length; i++) {
        const isLastPathKey = i === path.length - 1;
        const pathKey = path[i];
        const protocolVersion = pathKey.hooks === address2 ? 2 : pathKey.hooks === address3 ? 3 : 4;

        if (builder.currProtocolVersion !== protocolVersion) {
            // Protocol version change: build swap & update current protocol version
            if (builder.currProtocolVersion === 2) {
                buildV2Swap({
                    builder,
                    weth,
                    currencyOut,
                    amountIn,
                    amountOutMinimum,
                    recipient,
                    isLastSwap: false,
                });
                builder.currProtocolVersion = protocolVersion;
            } else if (builder.currProtocolVersion === 3) {
                buildV3Swap({
                    builder,
                    weth,
                    currencyOut,
                    amountIn,
                    amountOutMinimum,
                    recipient,
                    isLastSwap: false,
                });
                builder.currProtocolVersion = protocolVersion;
            } else {
                buildV4Swap({
                    builder,
                    weth,
                    currencyOut,
                    amountIn,
                    amountOutMinimum,
                    recipient,
                    isLastSwap: false,
                });
                builder.currProtocolVersion = protocolVersion;
            }
        }

        // Create or extend current path
        builder.currPath.push(pathKey);

        if (isLastPathKey) {
            // Last path key: build final swap command
            // Protocol version change: build swap & update current protocol version
            if (builder.currProtocolVersion === 2) {
                buildV2Swap({
                    builder,
                    weth,
                    currencyOut,
                    amountIn,
                    amountOutMinimum,
                    recipient,
                    isLastSwap: true,
                });
            } else if (builder.currProtocolVersion === 3) {
                buildV3Swap({
                    builder,
                    weth,
                    currencyOut,
                    amountIn,
                    amountOutMinimum,
                    recipient,
                    isLastSwap: true,
                });
            } else {
                buildV4Swap({
                    builder,
                    weth,
                    currencyOut,
                    amountIn,
                    amountOutMinimum,
                    recipient,
                    isLastSwap: true,
                });
            }
        }
    }
}
