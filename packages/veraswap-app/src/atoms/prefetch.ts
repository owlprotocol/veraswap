import { atomWithQuery, AtomWithQueryResult } from "jotai-tanstack-query";
import { getBytecodeQueryOptions, readContractQueryOptions } from "@wagmi/core/query";
import { queryOptions } from "@tanstack/react-query";
import {
    HYPERLANE_CONTRACTS,
    LOCAL_HYPERLANE_CONTRACTS,
    LOCAL_KERNEL_CONTRACTS,
    PERMIT2_ADDRESS,
    UNISWAP_CONTRACTS,
} from "@owlprotocol/veraswap-sdk/constants";
import {
    ERC7579ExecutorRouter,
    HypERC20Collateral,
    IAllowanceTransfer,
    IERC20,
    IInterchainGasPaymaster,
    KernelFactory,
    OwnableSignatureExecutor,
} from "@owlprotocol/veraswap-sdk/artifacts";
import { Address, Hex, zeroAddress } from "viem";
import { atom, WritableAtom } from "jotai";
import { tokenInAtom, tokenOutAtom } from "./tokens.js";
import { kernelSmartAccountAddressAtom, kernelSmartAccountInitDataAtom } from "./kernelSmartAccount.js";
import { accountAtom } from "./account.js";
import { hyperlaneRegistryAtom } from "./atoms.js";
import { config } from "@/config.js";

const disabledQueryOptions = queryOptions({
    queryKey: ["null"],
    queryFn: () => null,
    enabled: false,
});

// -----------------------------------------------------------------------------
// Kernel Smart Account Queries
// -----------------------------------------------------------------------------

const kernelAddressChainInQueryAtom = atomWithQuery((get) => {
    const tokenIn = get(tokenInAtom);
    const { data: initData } = get(kernelSmartAccountInitDataAtom);
    const factoryAddress = LOCAL_KERNEL_CONTRACTS.kernelFactory;

    if (!tokenIn || !initData || !factoryAddress) return disabledQueryOptions as any;

    return readContractQueryOptions(config, {
        chainId: tokenIn.chainId,
        address: factoryAddress,
        abi: KernelFactory.abi,
        functionName: "getAddress",
        args: [initData, zeroAddress],
    });
}) as WritableAtom<AtomWithQueryResult<Address, Error>, [], void>;

const kernelAddressChainOutQueryAtom = atomWithQuery((get) => {
    const tokenOut = get(tokenOutAtom);
    const { data: initData } = get(kernelSmartAccountInitDataAtom);
    const factoryAddress = LOCAL_KERNEL_CONTRACTS.kernelFactory;

    if (!tokenOut || !initData || !factoryAddress) return disabledQueryOptions as any;

    return readContractQueryOptions(config, {
        chainId: tokenOut.chainId,
        address: factoryAddress,
        abi: KernelFactory.abi,
        functionName: "getAddress",
        args: [initData, zeroAddress],
    });
}) as WritableAtom<AtomWithQueryResult<Address, Error>, [], void>;

const kernelBytecodeChainInQueryAtom = atomWithQuery((get) => {
    const tokenIn = get(tokenInAtom);
    const { data: kernelAddress } = get(kernelSmartAccountAddressAtom);

    if (!tokenIn || !kernelAddress) return disabledQueryOptions as any;

    return getBytecodeQueryOptions(config, {
        chainId: tokenIn!.chainId,
        address: kernelAddress,
    });
}) as unknown as WritableAtom<AtomWithQueryResult<Hex | undefined, Error>, [], void>;

const kernelBytecodeChainOutQueryAtom = atomWithQuery((get) => {
    const tokenOut = get(tokenOutAtom);
    const { data: kernelAddress } = get(kernelSmartAccountAddressAtom);

    if (!tokenOut || !kernelAddress) {
        return disabledQueryOptions as any;
    }

    return getBytecodeQueryOptions(config, {
        chainId: tokenOut.chainId,
        address: kernelAddress,
    });
}) as unknown as WritableAtom<AtomWithQueryResult<Hex | undefined, Error>, [], void>;

// -----------------------------------------------------------------------------
// ERC20 Token Queries
// -----------------------------------------------------------------------------

const erc20BalanceQueryAtom = atomWithQuery((get) => {
    const tokenIn = get(tokenInAtom);
    const account = get(accountAtom);

    if (!tokenIn || !account?.address) return disabledQueryOptions as any;

    return readContractQueryOptions(config, {
        chainId: tokenIn.chainId,
        address: tokenIn.address,
        abi: IERC20.abi,
        functionName: "balanceOf",
        args: [account.address],
    });
}) as WritableAtom<AtomWithQueryResult<bigint, Error>, [], void>;

const erc20AllowanceQueryAtom = atomWithQuery((get) => {
    const tokenIn = get(tokenInAtom);
    const account = get(accountAtom);
    const { data: kernelAddress } = get(kernelSmartAccountAddressAtom);

    if (!tokenIn || !account?.address || !kernelAddress) return disabledQueryOptions as any;

    return readContractQueryOptions(config, {
        chainId: tokenIn.chainId,
        address: tokenIn.address,
        abi: IERC20.abi,
        functionName: "allowance",
        args: [account.address, kernelAddress],
    });
}) as WritableAtom<AtomWithQueryResult<bigint, Error>, [], void>;

const wrappedTokenQueryAtom = atomWithQuery((get) => {
    const tokenIn = get(tokenInAtom);

    if (!tokenIn) return disabledQueryOptions as any;

    return readContractQueryOptions(config, {
        chainId: tokenIn.chainId,
        address: tokenIn.address,
        abi: HypERC20Collateral.abi,
        functionName: "wrappedToken",
        args: [],
    });
}) as WritableAtom<AtomWithQueryResult<Address, Error>, [], void>;

// -----------------------------------------------------------------------------
// Permit2 Allowance Queries
// -----------------------------------------------------------------------------

const permit2AllowanceAccountQueryAtom = atomWithQuery((get) => {
    const tokenIn = get(tokenInAtom);
    const account = get(accountAtom);
    const { data: kernelAddress } = get(kernelSmartAccountAddressAtom);

    if (!tokenIn || !account?.address || !kernelAddress) return disabledQueryOptions as any;

    return readContractQueryOptions(config, {
        chainId: tokenIn.chainId,
        address: PERMIT2_ADDRESS,
        abi: IAllowanceTransfer.abi,
        functionName: "allowance",
        args: [account.address, tokenIn.address, kernelAddress],
    });
}) as WritableAtom<AtomWithQueryResult<readonly [bigint, number, number], Error>, [], void>;

const permit2AllowanceUniswapRouterQueryAtom = atomWithQuery((get) => {
    const tokenIn = get(tokenInAtom);
    const account = get(accountAtom);
    const uniswapRouter = UNISWAP_CONTRACTS[tokenIn?.chainId ?? 0]?.universalRouter;

    if (!tokenIn || !account?.address || !uniswapRouter) return disabledQueryOptions as any;

    return readContractQueryOptions(config, {
        chainId: tokenIn.chainId,
        address: PERMIT2_ADDRESS,
        abi: IAllowanceTransfer.abi,
        functionName: "allowance",
        args: [account.address, tokenIn.address, uniswapRouter],
    });
}) as WritableAtom<AtomWithQueryResult<readonly [bigint, number, number], Error>, [], void>;

const permit2AllowanceKernelAccountQueryAtom = atomWithQuery((get) => {
    const tokenIn = get(tokenInAtom);
    const { data: kernelAddress } = get(kernelSmartAccountAddressAtom);
    const uniswapRouter = UNISWAP_CONTRACTS[tokenIn?.chainId ?? 0]?.universalRouter;

    if (!tokenIn || !kernelAddress || !uniswapRouter) return disabledQueryOptions as any;

    return readContractQueryOptions(config, {
        chainId: tokenIn.chainId,
        address: PERMIT2_ADDRESS,
        abi: IAllowanceTransfer.abi,
        functionName: "allowance",
        args: [kernelAddress, tokenIn.address, uniswapRouter],
    });
}) as WritableAtom<AtomWithQueryResult<readonly [bigint, number, number], Error>, [], void>;

const permit2AllowanceKernelAccountChainOutQueryAtom = atomWithQuery((get) => {
    const tokenOut = get(tokenOutAtom);
    const { data: kernelAddress } = get(kernelSmartAccountAddressAtom);
    const uniswapRouter = UNISWAP_CONTRACTS[tokenOut?.chainId ?? 0]?.universalRouter;

    if (!tokenOut || !kernelAddress || !uniswapRouter) return disabledQueryOptions as any;

    return readContractQueryOptions(config, {
        chainId: tokenOut.chainId,
        address: PERMIT2_ADDRESS,
        abi: IAllowanceTransfer.abi,
        functionName: "allowance",
        args: [kernelAddress, tokenOut.address, uniswapRouter],
    });
}) as WritableAtom<AtomWithQueryResult<readonly [bigint, number, number], Error>, [], void>;

// -----------------------------------------------------------------------------
// Ownable Executor Queries
// -----------------------------------------------------------------------------

const isExecutorInitializedQueryAtom = atomWithQuery((get) => {
    const tokenIn = get(tokenInAtom);
    const kernelAddress = get(kernelSmartAccountAddressAtom).data;
    const executor = LOCAL_KERNEL_CONTRACTS.execute;

    if (!tokenIn || !kernelAddress || !executor) return disabledQueryOptions as any;

    return readContractQueryOptions(config, {
        chainId: tokenIn.chainId,
        address: executor,
        abi: OwnableSignatureExecutor.abi,
        functionName: "isInitialized",
        args: [kernelAddress],
    });
}) as WritableAtom<AtomWithQueryResult<boolean, Error>, [], void>;

const isExecutorInitializedChainOutQueryAtom = atomWithQuery((get) => {
    const tokenOut = get(tokenOutAtom);
    const { data: kernelAddress } = get(kernelSmartAccountAddressAtom);
    const executor = LOCAL_KERNEL_CONTRACTS.execute;

    if (!tokenOut || !kernelAddress || !executor) return disabledQueryOptions as any;

    return readContractQueryOptions(config, {
        chainId: tokenOut.chainId,
        address: executor,
        abi: OwnableSignatureExecutor.abi,
        functionName: "isInitialized",
        args: [kernelAddress],
    });
}) as WritableAtom<AtomWithQueryResult<boolean, Error>, [], void>;

const getOwnersQueryAtom = atomWithQuery((get) => {
    const tokenIn = get(tokenInAtom);
    const kernelAddress = get(kernelSmartAccountAddressAtom).data;
    const executor = LOCAL_KERNEL_CONTRACTS.execute;
    const { data: isInitialized } = get(isExecutorInitializedQueryAtom);

    if (!tokenIn || !kernelAddress || !executor || !isInitialized) return disabledQueryOptions as any;

    return readContractQueryOptions(config, {
        chainId: tokenIn.chainId,
        address: executor,
        abi: OwnableSignatureExecutor.abi,
        functionName: "getOwners",
        args: [kernelAddress],
    });
}) as WritableAtom<AtomWithQueryResult<readonly Address[], Error>, [], void>;

const ownableExecutorNonceChainInAtom = atomWithQuery((get) => {
    const { data: kernelAddress } = get(kernelSmartAccountAddressAtom);
    const tokenIn = get(tokenInAtom);
    const executor = LOCAL_KERNEL_CONTRACTS.execute;

    if (!kernelAddress || !tokenIn || !executor) return disabledQueryOptions as any;

    return readContractQueryOptions(config, {
        chainId: tokenIn.chainId,
        address: executor,
        abi: OwnableSignatureExecutor.abi,
        functionName: "getNonce",
        args: [kernelAddress, 0n],
    });
}) as WritableAtom<AtomWithQueryResult<bigint, Error>, [], void>;

const ownableExecutorNonceChainOutAtom = atomWithQuery((get) => {
    const { data: kernelAddress } = get(kernelSmartAccountAddressAtom);
    const tokenOut = get(tokenOutAtom);
    const executor = LOCAL_KERNEL_CONTRACTS.execute;

    if (!kernelAddress || !tokenOut || !executor) return disabledQueryOptions as any;

    return readContractQueryOptions(config, {
        chainId: tokenOut.chainId,
        address: executor,
        abi: OwnableSignatureExecutor.abi,
        functionName: "getNonce",
        args: [kernelAddress, 0n],
    });
}) as WritableAtom<AtomWithQueryResult<bigint, Error>, [], void>;

// -----------------------------------------------------------------------------
// Hyperlane & Cross-Chain Queries
// -----------------------------------------------------------------------------

const tokenRouterGasPaymentQueryAtom = atomWithQuery((get) => {
    const tokenIn = get(tokenInAtom);
    const tokenOut = get(tokenOutAtom);

    if (!tokenIn || !tokenOut) return disabledQueryOptions as any;

    return readContractQueryOptions(config, {
        chainId: tokenIn.chainId,
        address: tokenIn.address,
        abi: HypERC20Collateral.abi,
        functionName: "quoteGasPayment",
        args: [tokenOut.chainId],
    });
}) as WritableAtom<AtomWithQueryResult<bigint, Error>, [], void>;

const interchainGasQuoteQueryAtom = atomWithQuery((get) => {
    const tokenIn = get(tokenInAtom);
    const tokenOut = get(tokenOutAtom);
    const callRemoteGas = 1_000_000n;
    const hyperlaneRegistry = get(hyperlaneRegistryAtom);

    if (!tokenIn?.chainId || !tokenOut?.chainId || !hyperlaneRegistry) return disabledQueryOptions as any;

    const interchainGasPaymaster =
        hyperlaneRegistry.addresses[tokenIn.chainId]?.interchainGasPaymaster ??
        LOCAL_HYPERLANE_CONTRACTS[tokenIn.chainId]?.mockInterchainGasPaymaster;

    if (!interchainGasPaymaster) return disabledQueryOptions as any;

    return readContractQueryOptions(config, {
        chainId: tokenIn.chainId,
        address: interchainGasPaymaster,
        abi: IInterchainGasPaymaster.abi,
        functionName: "quoteGasPayment",
        args: [tokenOut.chainId, callRemoteGas],
    });
}) as WritableAtom<AtomWithQueryResult<bigint, Error>, [], void>;

// -----------------------------------------------------------------------------
// ERC7579 & Cross-Chain Ownership Queries
// -----------------------------------------------------------------------------

const erc7579IsOwnerRemoteQueryAtom = atomWithQuery((get) => {
    const tokenIn = get(tokenInAtom);
    const tokenOut = get(tokenOutAtom);
    const account = get(accountAtom);
    const { data: kernelAddress } = get(kernelSmartAccountAddressAtom);

    if (!tokenIn?.chainId || !tokenOut?.chainId || !kernelAddress || !account?.address) {
        return disabledQueryOptions as any;
    }

    const erc7579RouterIn = HYPERLANE_CONTRACTS[tokenIn.chainId].erc7579Router;
    const erc7579RouterOut = HYPERLANE_CONTRACTS[tokenOut.chainId].erc7579Router;

    if (!erc7579RouterIn || !erc7579RouterOut) {
        return disabledQueryOptions as any;
    }

    return readContractQueryOptions(config, {
        chainId: tokenOut!.chainId,
        address: erc7579RouterOut,
        abi: ERC7579ExecutorRouter.abi,
        functionName: "owners",
        args: [kernelAddress, tokenIn.chainId, erc7579RouterIn, account.address],
    });
}) as WritableAtom<AtomWithQueryResult<boolean, Error>, [], void>;

const erc7579IsOwnerChainInQueryAtom = atomWithQuery((get) => {
    const tokenIn = get(tokenInAtom);
    const tokenOut = get(tokenOutAtom);
    const account = get(accountAtom);
    const { data: kernelAddress } = get(kernelSmartAccountAddressAtom);

    if (!tokenIn || !tokenOut || !account?.address || !kernelAddress) return disabledQueryOptions as any;

    const erc7579RouterOut = HYPERLANE_CONTRACTS[tokenOut.chainId]?.erc7579Router;
    const erc7579RouterIn = HYPERLANE_CONTRACTS[tokenIn.chainId]?.erc7579Router;

    if (!erc7579RouterIn || !erc7579RouterOut) return disabledQueryOptions as any;

    return readContractQueryOptions(config, {
        chainId: tokenIn.chainId,
        address: erc7579RouterIn,
        abi: ERC7579ExecutorRouter.abi,
        functionName: "owners",
        args: [kernelAddress, tokenOut.chainId, erc7579RouterOut, account.address],
    });
}) as WritableAtom<AtomWithQueryResult<boolean, Error>, [], void>;

const erc7579IsOwnerChainOutQueryAtom = atomWithQuery((get) => {
    const tokenIn = get(tokenInAtom);
    const tokenOut = get(tokenOutAtom);
    const account = get(accountAtom);
    const { data: kernelAddress } = get(kernelSmartAccountAddressAtom);

    if (!tokenIn || !tokenOut || !account?.address || !kernelAddress) return disabledQueryOptions as any;

    const erc7579RouterOut = HYPERLANE_CONTRACTS[tokenOut.chainId]?.erc7579Router;
    const erc7579RouterIn = HYPERLANE_CONTRACTS[tokenIn.chainId]?.erc7579Router;

    if (!erc7579RouterIn || !erc7579RouterOut) return disabledQueryOptions as any;

    return readContractQueryOptions(config, {
        chainId: tokenOut.chainId,
        address: erc7579RouterOut,
        abi: ERC7579ExecutorRouter.abi,
        functionName: "owners",
        args: [kernelAddress, tokenIn.chainId, erc7579RouterIn, account.address],
    });
}) as WritableAtom<AtomWithQueryResult<boolean, Error>, [], void>;

export const prefetchQueriesAtom = atom((get) => [
    get(kernelAddressChainInQueryAtom),
    get(kernelAddressChainOutQueryAtom),
    get(kernelBytecodeChainInQueryAtom),
    get(kernelBytecodeChainOutQueryAtom),
    get(erc20BalanceQueryAtom),
    get(erc20AllowanceQueryAtom),
    get(wrappedTokenQueryAtom),
    get(permit2AllowanceAccountQueryAtom),
    get(permit2AllowanceUniswapRouterQueryAtom),
    get(permit2AllowanceKernelAccountQueryAtom),
    get(permit2AllowanceKernelAccountChainOutQueryAtom),
    get(isExecutorInitializedQueryAtom),
    get(isExecutorInitializedChainOutQueryAtom),
    get(getOwnersQueryAtom),
    get(ownableExecutorNonceChainInAtom),
    get(ownableExecutorNonceChainOutAtom),
    get(tokenRouterGasPaymentQueryAtom),
    get(interchainGasQuoteQueryAtom),
    get(erc7579IsOwnerRemoteQueryAtom),
    get(erc7579IsOwnerChainInQueryAtom),
    get(erc7579IsOwnerChainOutQueryAtom),
]);
