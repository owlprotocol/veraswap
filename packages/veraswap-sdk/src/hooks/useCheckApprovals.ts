import { useReadContracts } from "wagmi";
import { Address } from "viem";

import { MockERC20 } from "../artifacts/MockERC20.js";
import { IAllowanceTransfer } from "../artifacts/IAllowanceTransfer.js";
import { PoolKey } from "../types/PoolKey.js";

const MAX_UINT_256 = 2n ** 256n - 1n;
const MAX_UINT_160 = 2n ** 160n - 1n;

interface CheckApprovalsParams {
    poolKey?: PoolKey;
    walletAddress?: Address;
    PERMIT2_ADDRESS: Address;
    POSITION_MANAGER: Address;
}

export function useCheckApprovals({ poolKey, walletAddress, PERMIT2_ADDRESS, POSITION_MANAGER }: CheckApprovalsParams) {
    const isValid = !!poolKey && !!walletAddress;

    const { data, isLoading, isError } = useReadContracts({
        contracts: isValid
            ? [
                  {
                      address: poolKey!.currency0,
                      abi: MockERC20.abi,
                      functionName: "allowance",
                      args: [walletAddress, PERMIT2_ADDRESS],
                  },
                  {
                      address: poolKey!.currency1,
                      abi: MockERC20.abi,
                      functionName: "allowance",
                      args: [walletAddress!, PERMIT2_ADDRESS],
                  },
                  {
                      address: PERMIT2_ADDRESS,
                      abi: IAllowanceTransfer.abi,
                      functionName: "allowance",
                      args: [walletAddress, poolKey.currency0, POSITION_MANAGER],
                  },
                  {
                      address: PERMIT2_ADDRESS,
                      abi: IAllowanceTransfer.abi,
                      functionName: "allowance",
                      args: [walletAddress, poolKey.currency1, POSITION_MANAGER],
                  },
              ]
            : [],
        query: { enabled: isValid },
    });

    //TODO: Fix type
    const token0Allowance = data?.[0]?.result ?? 0n;
    const token1Allowance = data?.[1]?.result ?? 0n;
    const permit2Allowance0 = data?.[2]?.result ? data[2].result[0] : 0n;
    const permit2Allowance1 = data?.[3]?.result ? data[3].result[0] : 0n;

    return {
        isToken0Approved: token0Allowance >= MAX_UINT_256,
        isToken1Approved: token1Allowance >= MAX_UINT_256,
        isPermit2Approved0: permit2Allowance0 >= MAX_UINT_160,
        isPermit2Approved1: permit2Allowance1 >= MAX_UINT_160,
        isLoading,
        isError,
    };
}
