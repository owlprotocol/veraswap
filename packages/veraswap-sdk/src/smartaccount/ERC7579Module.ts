import { Address, concatHex, encodeAbiParameters, Hex, parseAbiParameters, zeroAddress } from "viem";

export enum ERC7579_MODULE_TYPE {
    VALIDATOR = 1,
    EXECUTOR = 2,
    FALLBACK = 3,
    HOOK = 4,
}

/**
 * Packed encoding of Kernel executor install data
 * @param param executorData (packed), hook (optional), hookData (optional)
 * @returns
 */
export function encodeInstallExecutorData({
    executorData,
    hook,
    hookData,
}: {
    executorData: Hex;
    hook?: Address;
    hookData?: Hex;
}): Hex {
    return concatHex([
        hook ?? zeroAddress,
        encodeAbiParameters(parseAbiParameters(["bytes", "bytes"]), [executorData, hookData ?? "0x"]),
    ]);
}
