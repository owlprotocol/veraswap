import { Hex } from "viem";

export const fallback = { type: "fallback", stateMutability: "nonpayable" } as const;
export const UnsupportedProtocolError = { type: "error", name: "UnsupportedProtocolError", inputs: [] } as const;
export const functions = [fallback] as const;
export const events = [] as const;
export const errors = [UnsupportedProtocolError] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const bytecode =
    "0x60808060405234601357604c908160188239f35b5f80fdfe3460125763ea3559ef60e01b5f5260045ffd5b5f80fdfea26469706673582212201b99040edd8f8f837e80337bcd168e8ef31795744bb70314cd6764665ecf577e64736f6c634300081a0033" as Hex;
export const deployedBytecode =
    "0x3460125763ea3559ef60e01b5f5260045ffd5b5f80fdfea26469706673582212201b99040edd8f8f837e80337bcd168e8ef31795744bb70314cd6764665ecf577e64736f6c634300081a0033" as Hex;
export const UnsupportedProtocol = {
    abi,
    bytecode,
    deployedBytecode,
};
