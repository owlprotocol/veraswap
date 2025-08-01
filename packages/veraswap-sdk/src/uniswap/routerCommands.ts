/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable no-case-declarations */
import type { AbiParametersToPrimitiveTypes } from "abitype";
import { encodeAbiParameters, Hex, hexToBigInt } from "viem";

import {
    permit,
    permit_address___address_uint160_uint48_uint48__address_uint256__bytes,
} from "../artifacts/IAllowanceTransfer.js";

export const ACTION_CONSTANTS = {
    MSG_SENDER: "0x0000000000000000000000000000000000000001",
    ADDRESS_THIS: "0x0000000000000000000000000000000000000002",
    CONTRACT_BALANCE: hexToBigInt("0x8000000000000000000000000000000000000000000000000000000000000000"),
    OPEN_DELTA: 0n,
} as const;

/**
 * CommandTypes
 * @description Flags that modify a command's execution
 * @enum {number}
 */
export enum CommandType {
    V3_SWAP_EXACT_IN = 0x00,
    V3_SWAP_EXACT_OUT = 0x01,
    PERMIT2_TRANSFER_FROM = 0x02,
    PERMIT2_PERMIT_BATCH = 0x03,
    SWEEP = 0x04,
    TRANSFER = 0x05,
    PAY_PORTION = 0x06,

    V2_SWAP_EXACT_IN = 0x08,
    V2_SWAP_EXACT_OUT = 0x09,
    PERMIT2_PERMIT = 0x0a,
    WRAP_ETH = 0x0b,
    UNWRAP_WETH = 0x0c,
    PERMIT2_TRANSFER_FROM_BATCH = 0x0d,
    BALANCE_CHECK_ERC20 = 0x0e,

    V4_SWAP = 0x10,
    V3_POSITION_MANAGER_PERMIT = 0x11,
    V3_POSITION_MANAGER_CALL = 0x12,
    V4_INITIALIZE_POOL = 0x13,
    V4_POSITION_MANAGER_CALL = 0x14,

    EXECUTE_SUB_PLAN = 0x21,

    // Custom Commands
    CALL_TARGET = 0x22,
}

export enum Subparser {
    V3PathExactIn,
    V3PathExactOut,
}

export enum Parser {
    Abi,
    V4Actions,
    V3Actions,
}

export interface ParamType {
    readonly name: string;
    readonly type: string;
    readonly subparser?: Subparser;
}

export type CommandDefinition =
    | {
          parser: Parser.Abi;
          params: ParamType[];
      }
    | {
          parser: Parser.V4Actions;
      }
    | {
          parser: Parser.V3Actions;
      };

const ALLOW_REVERT_FLAG = 0x80;
const REVERTIBLE_COMMANDS = new Set<CommandType>([CommandType.EXECUTE_SUB_PLAN]);

const PERMIT_STRUCT = permit_address___address_uint160_uint48_uint48__address_uint256__bytes.inputs[1];

const PERMIT_BATCH_STRUCT = permit.inputs[1];

const POOL_KEY_STRUCT = "(address currency0,address currency1,uint24 fee,int24 tickSpacing,address hooks)";

const PERMIT2_TRANSFER_FROM_STRUCT = "(address from,address to,uint160 amount,address token)";
const PERMIT2_TRANSFER_FROM_BATCH_STRUCT = PERMIT2_TRANSFER_FROM_STRUCT + "[]";

export const COMMAND_DEFINITION = {
    // Batch Reverts
    [CommandType.EXECUTE_SUB_PLAN]: {
        parser: Parser.Abi,
        params: [
            { name: "commands", type: "bytes" },
            { name: "inputs", type: "bytes[]" },
        ],
    },

    // Permit2 Actions
    [CommandType.PERMIT2_PERMIT]: {
        parser: Parser.Abi,
        params: [PERMIT_STRUCT, { name: "signature", type: "bytes" }],
    },
    [CommandType.PERMIT2_PERMIT_BATCH]: {
        parser: Parser.Abi,
        params: [PERMIT_BATCH_STRUCT, { name: "signature", type: "bytes" }],
    },
    [CommandType.PERMIT2_TRANSFER_FROM]: {
        parser: Parser.Abi,
        params: [
            { name: "token", type: "address" },
            { name: "recipient", type: "address" },
            { name: "amount", type: "uint160" },
        ],
    },
    [CommandType.PERMIT2_TRANSFER_FROM_BATCH]: {
        parser: Parser.Abi,
        params: [
            {
                name: "transferFrom",
                type: PERMIT2_TRANSFER_FROM_BATCH_STRUCT,
            },
        ],
    },

    // Uniswap Actions
    [CommandType.V3_SWAP_EXACT_IN]: {
        parser: Parser.Abi,
        params: [
            { name: "recipient", type: "address" },
            { name: "amountIn", type: "uint256" },
            { name: "amountOutMin", type: "uint256" },
            { name: "path", subparser: Subparser.V3PathExactIn, type: "bytes" },
            { name: "payerIsUser", type: "bool" },
        ],
    },
    [CommandType.V3_SWAP_EXACT_OUT]: {
        parser: Parser.Abi,
        params: [
            { name: "recipient", type: "address" },
            { name: "amountOut", type: "uint256" },
            { name: "amountInMax", type: "uint256" },
            { name: "path", subparser: Subparser.V3PathExactOut, type: "bytes" },
            { name: "payerIsUser", type: "bool" },
        ],
    },
    [CommandType.V2_SWAP_EXACT_IN]: {
        parser: Parser.Abi,
        params: [
            { name: "recipient", type: "address" },
            { name: "amountIn", type: "uint256" },
            { name: "amountOutMin", type: "uint256" },
            { name: "path", type: "address[]" },
            { name: "payerIsUser", type: "bool" },
        ],
    },
    [CommandType.V2_SWAP_EXACT_OUT]: {
        parser: Parser.Abi,
        params: [
            { name: "recipient", type: "address" },
            { name: "amountOut", type: "uint256" },
            { name: "amountInMax", type: "uint256" },
            { name: "path", type: "address[]" },
            { name: "payerIsUser", type: "bool" },
        ],
    },
    [CommandType.V4_SWAP]: { parser: Parser.V4Actions, params: [{ name: "data", type: "bytes" }] },

    // Token Actions and Checks
    [CommandType.WRAP_ETH]: {
        parser: Parser.Abi,
        params: [
            { name: "recipient", type: "address" },
            { name: "amount", type: "uint256" },
        ],
    },
    [CommandType.UNWRAP_WETH]: {
        parser: Parser.Abi,
        params: [
            { name: "recipient", type: "address" },
            { name: "amountMin", type: "uint256" },
        ],
    },
    [CommandType.SWEEP]: {
        parser: Parser.Abi,
        params: [
            { name: "token", type: "address" },
            { name: "recipient", type: "address" },
            { name: "amountMin", type: "uint256" },
        ],
    },
    [CommandType.TRANSFER]: {
        parser: Parser.Abi,
        params: [
            { name: "token", type: "address" },
            { name: "recipient", type: "address" },
            { name: "value", type: "uint256" },
        ],
    },
    [CommandType.PAY_PORTION]: {
        parser: Parser.Abi,
        params: [
            { name: "token", type: "address" },
            { name: "recipient", type: "address" },
            { name: "bips", type: "uint256" },
        ],
    },
    [CommandType.BALANCE_CHECK_ERC20]: {
        parser: Parser.Abi,
        params: [
            { name: "owner", type: "address" },
            { name: "token", type: "address" },
            { name: "minBalance", type: "uint256" },
        ],
    },
    [CommandType.V4_INITIALIZE_POOL]: {
        parser: Parser.Abi,
        params: [
            { name: "poolKey", type: POOL_KEY_STRUCT },
            { name: "sqrtPriceX96", type: "uint160" },
        ],
    },

    // Position Actions (already encoded)
    [CommandType.V3_POSITION_MANAGER_PERMIT]: {
        parser: Parser.V3Actions,
        params: [{ name: "data", type: "bytes" }],
    },
    [CommandType.V3_POSITION_MANAGER_CALL]: {
        parser: Parser.V3Actions,
        params: [{ name: "data", type: "bytes" }],
    },
    [CommandType.V4_POSITION_MANAGER_CALL]: {
        parser: Parser.V4Actions,
        params: [{ name: "data", type: "bytes" }],
    },
    /*
    // Custom commands
    [CommandType.APPROVE_REENTRANT]: {
        parser: Parser.Abi,
        params: [{ name: "approvedReentrant", type: "address" }],
    },
    */
    [CommandType.CALL_TARGET]: {
        parser: Parser.Abi,
        params: [
            { name: "target", type: "address" },
            { name: "value", type: "uint256" },
            { name: "data", type: "bytes" },
        ],
    },
} as const;

export class RoutePlanner {
    commands: Hex;
    inputs: Hex[];

    constructor() {
        this.commands = "0x";
        this.inputs = [];
    }

    /**
     * Create a RoutePlanner from an array of encoded RouterCommands
     * @param commands - Array of RouterCommand objects
     * @returns A new RoutePlanner instance
     */
    static create(commands: RouterCommand[]): RoutePlanner {
        const plan = new RoutePlanner();
        plan.commands = ("0x" + commands.map((command) => command.type.toString(16).padStart(2, "0")).join("")) as Hex;
        plan.inputs = commands.map((command) => command.encodedInput);
        return plan;
    }

    addSubPlan(subplan: RoutePlanner): RoutePlanner {
        this.addCommand(CommandType.EXECUTE_SUB_PLAN, [subplan.commands, subplan.inputs], true);
        return this;
    }

    addCommand<T extends CommandType>(
        type: T,
        parameters: AbiParametersToPrimitiveTypes<(typeof COMMAND_DEFINITION)[T]["params"]>,
        allowRevert = false,
    ): RoutePlanner {
        const command = createCommand(type, parameters);
        this.inputs.push(command.encodedInput);
        if (allowRevert) {
            if (!REVERTIBLE_COMMANDS.has(command.type)) {
                throw new Error(`command type: ${command.type} cannot be allowed to revert`);
            }
            command.type = command.type | ALLOW_REVERT_FLAG;
        }

        this.commands = this.commands.concat(command.type.toString(16).padStart(2, "0")) as Hex;
        return this;
    }
}

export interface RouterCommand {
    type: CommandType;
    encodedInput: Hex;
}

export type CreateCommandParamsGeneric = [CommandType, readonly any[]];

export function createCommand<T extends CommandType>(
    type: T,
    parameters: AbiParametersToPrimitiveTypes<(typeof COMMAND_DEFINITION)[T]["params"]>,
): RouterCommand {
    const commandDef = COMMAND_DEFINITION[type];
    switch (commandDef.parser) {
        case Parser.Abi:
            const encodedInput = encodeAbiParameters(commandDef.params, parameters as any);
            return { type, encodedInput };
        case Parser.V4Actions:
            // v4 swap data comes pre-encoded at index 0
            return { type, encodedInput: parameters[0] as any };
        case Parser.V3Actions:
            // v4 swap data comes pre-encoded at index 0
            return { type, encodedInput: parameters[0] as any };
    }
}
