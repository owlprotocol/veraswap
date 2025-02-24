import { useMemo } from "react";
import { useReadContract } from "wagmi";
import { keccak256, encodeAbiParameters, Address } from "viem";
import { IStateView } from "../artifacts/IStateView.js";
import { PoolKey } from "../types/PoolKey.js";

const PoolKeyAbi = {
    components: [
        { internalType: "address", name: "currency0", type: "address" },
        { internalType: "address", name: "currency1", type: "address" },
        { internalType: "uint24", name: "fee", type: "uint24" },
        { internalType: "int24", name: "tickSpacing", type: "int24" },
        { internalType: "address", name: "hooks", type: "address" },
    ],
    internalType: "struct PoolKey",
    type: "tuple",
} as const;

export function usePoolExists(poolKey: PoolKey, stateViewAddress: Address) {
    const poolId = useMemo(() => {
        return keccak256(encodeAbiParameters([PoolKeyAbi], [poolKey]));
    }, [poolKey]);

    const { data, isLoading, isError } = useReadContract({
        address: stateViewAddress,
        abi: IStateView.abi,
        functionName: "getLiquidity",
        args: [poolId],
    });

    return {
        exists: Boolean(data && data > 0n),
        isLoading,
        isError,
    };
}
