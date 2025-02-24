import { useMemo } from "react";
import { useReadContracts } from "wagmi";
import { Address } from "viem";

import { PoolKey } from "../types/PoolKey.js";
import { MockERC20 } from "../artifacts/MockERC20.js";

export function useGetBalances(poolKey?: PoolKey, walletAddress?: Address) {
    const isValid = !!poolKey?.currency0 && !!poolKey?.currency1 && !!walletAddress;

    const contracts = useMemo(
        () =>
            isValid
                ? [
                    {
                        address: poolKey.currency0,
                        abi: MockERC20.abi,
                        functionName: "balanceOf",
                        args: [walletAddress],
                    },
                    {
                        address: poolKey.currency1,
                        abi: MockERC20.abi,
                        functionName: "balanceOf",
                        args: [walletAddress],
                    },
                ]
                : [],
        [isValid, poolKey, walletAddress],
    );

    const { data, isLoading, isError } = useReadContracts({
        contracts,
        query: { enabled: isValid },
    });

    const balance0 = isValid && data?.[0]?.result ? data[0].result : 0n;
    const balance1 = isValid && data?.[1]?.result ? data[1].result : 0n;

    return { balance0, balance1, isLoading, isError };
}
