import { Hex } from "viem";

export const fallback = { type: "fallback", stateMutability: "nonpayable" } as const;
export const UnsupportedProtocolError = { type: "error", name: "UnsupportedProtocolError", inputs: [] } as const;
export const functions = [fallback] as const;
export const events = [] as const;
export const errors = [UnsupportedProtocolError] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const bytecode =
    "0x608080604052346013576023908160188239f35b5f80fdfe3460125763ea3559ef60e01b5f5260045ffd5b5f80fdfea164736f6c634300081a000a" as Hex;
export const deployedBytecode = "0x3460125763ea3559ef60e01b5f5260045ffd5b5f80fdfea164736f6c634300081a000a" as Hex;
export const UnsupportedProtocol = {
    abi,
    bytecode,
    deployedBytecode,
};
