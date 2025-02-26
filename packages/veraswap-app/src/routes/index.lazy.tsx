import { createLazyFileRoute } from "@tanstack/react-router";
import { ArrowUpDown } from "lucide-react";
import {
  useAccount,
} from "wagmi";
import {
  getSwapExactInExecuteData,
  MAX_UINT_160,
  MAX_UINT_48,
  PERMIT2_ADDRESS,
  UNISWAP_CONTRACTS,
} from "@owlprotocol/veraswap-sdk";
import { encodeFunctionData, formatUnits } from "viem";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  IAllowanceTransfer,
  IERC20,
} from "@owlprotocol/veraswap-sdk/artifacts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NetworkSelect } from "@/components/NetworkSelect";
import { TokenSelect } from "@/components/TokenSelect";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { hyperlaneRegistryOptions } from "@/hooks/hyperlaneRegistry.js";
import { useAtom, useAtomValue } from "jotai";
import { chainInAtom, chainOutAtom, chainsAtom, poolKeyAtom, quoteAtom, sendTransactionMutationAtom, swapInvertAtom, SwapStep, swapStepAtom, tokenInAmountAtom, tokenInAmountInputAtom, tokenInAtom, tokenInBalanceQueryAtom, tokenInPermit2AllowanceQueryAtom, tokenInRouterAllowanceQueryAtom, tokenOutAtom, tokenOutBalanceQueryAtom, tokensInAtom, tokensOutAtom } from "../atoms/index.js"

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  const { isConnected, address: walletAddress } = useAccount();

  const chains = useAtomValue(chainsAtom)
  const [chainIn, setChainIn] = useAtom(chainInAtom)
  const [chainOut, setChainOut] = useAtom(chainOutAtom);

  const tokensIn = useAtomValue(tokensInAtom)
  const tokensOut = useAtomValue(tokensOutAtom)

  const [tokenIn, setTokenIn] = useAtom(tokenInAtom)
  const tokenInAmount = useAtomValue(tokenInAmountAtom)
  const { data: tokenInBalance, refetch: refetchBalanceIn } = useAtomValue(tokenInBalanceQueryAtom)

  const [tokenOut, setTokenOut] = useAtom(tokenOutAtom)
  const { data: tokenOutBalance, refetch: refetchBalanceOut } = useAtomValue(tokenOutBalanceQueryAtom)

  const poolKey = useAtomValue(poolKeyAtom)
  const { data: quoterData, error: quoterError, isLoading: isQuoterLoading } = useAtomValue(quoteAtom);

  const [tokenInAmountInput, setTokenInAmountInput] = useAtom(tokenInAmountInputAtom)
  const [, swapInvert] = useAtom(swapInvertAtom)
  const swapStep = useAtomValue(swapStepAtom)
  // const [tokenOutAmount, setTokenOutAmount] = useAtom(tokenOutAmountAtom)

  console.debug({ swapStep })

  const { toast } = useToast();

  const isNotConnected = !isConnected || !walletAddress;

  const { data: hyperlaneRegistry } = useSuspenseQuery(
    hyperlaneRegistryOptions(),
  );

  console.log("Hyperlane Registry Data", hyperlaneRegistry);

  const tokenInBalanceFormatted =
    tokenInBalance != undefined
      ? `${formatUnits(tokenInBalance, tokenIn!.decimals)} ${tokenIn!.symbol}`
      : "-";
  const tokenOutBalanceFormatted =
    tokenOutBalance != undefined
      ? `
     ${formatUnits(tokenOutBalance, tokenOut!.decimals)} ${tokenOut!.symbol}`
      : "-";

  const [{
    mutate: sendTransaction,
    data: hash,
    isPending: transactionIsPending,
  }] = useAtom(sendTransactionMutationAtom);

  const handleSwapSteps = () => {
    if (!swapStep || transactionIsPending) return;
    if (swapStep === SwapStep.APPROVE_PERMIT2) {
      sendTransaction({
        to: tokenIn!.address,
        data: encodeFunctionData({
          abi: IERC20.abi,
          functionName: "approve",
          args: [PERMIT2_ADDRESS, tokenInAmount!],
        }),
      });
      return;
    }

    if (swapStep === SwapStep.APPROVE_UNISWAP_ROUTER) {
      sendTransaction({
        to: PERMIT2_ADDRESS,
        data: encodeFunctionData({
          abi: IAllowanceTransfer.abi,
          functionName: "approve",
          args: [
            tokenIn!.address,
            UNISWAP_CONTRACTS[tokenIn!.chainId].UNIVERSAL_ROUTER,
            MAX_UINT_160,
            MAX_UINT_48,
          ],
        }),
      });
      return;
    }
    if (swapStep === SwapStep.EXECUTE_SWAP) {
      sendTransaction(
        getSwapExactInExecuteData({
          universalRouter: UNISWAP_CONTRACTS[tokenIn!.chainId].UNIVERSAL_ROUTER,
          poolKey: poolKey!,
          currencyIn: tokenIn!.address,
          currencyOut: tokenOut!.address,
          zeroForOne: tokenIn!.address === poolKey!.currency0,
          amountIn: tokenInAmount!,
          amountOutMinimum: quoterData![0],
        }),
      );
    }
  };

  /*
  useEffect(() => {
    if (receipt) {
      refetchBalanceIn();
      refetchBalanceOut();

      setTokenInAmountInput("");

      toast({
        title: "Swap Complete",
        description: "Your swap has been completed successfully",
        variant: "default",
      });
    }
  }, [receipt, refetchBalanceIn, refetchBalanceOut]);
  */

  return (
    <div className="max-w-xl mx-auto px-4">
      <Card className="w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl">
        <CardContent className="p-4 space-y-6">
          <div className="space-y-4">
            <div className="rounded-2xl bg-gray-50 dark:bg-gray-700 p-4 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
              <div className="mb-2 flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  From
                </span>
                <NetworkSelect
                  value={chainIn}
                  onChange={setChainIn}
                  networks={chains}
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={tokenInAmountInput}
                  onChange={(e) => setTokenInAmountInput(e.target.value)}
                  type="number"
                  className={cn(
                    "border-0 bg-transparent text-3xl font-semibold p-0",
                    "ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                    "hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors",
                  )}
                  placeholder="0.0"
                  disabled={!tokenIn}
                />
                <TokenSelect
                  value={tokenIn}
                  onChange={setTokenIn}
                  tokens={tokensIn}
                />
              </div>
              <div className="mt-2 flex justify-end text-sm text-gray-500 dark:text-gray-400">
                {/* TODO: enable if we can get a dollar value <div className="mt-2 flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>$0.00</span> */}
                <div className="space-x-2">
                  <span>Balance: {tokenInBalanceFormatted}</span>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-sm"
                    onClick={() => tokenInBalance && setTokenInAmountInput(formatUnits(tokenInBalance, tokenIn!.decimals))}
                  >
                    Max
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-center -my-2 relative z-10">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-12 w-12 bg-white dark:bg-gray-700 shadow-lg hover:scale-105 transform transition-all"
                onClick={swapInvert}
                disabled={!tokenInAmount}
              >
                <ArrowUpDown className="h-6 w-6" />
              </Button>
            </div>

            <div className="rounded-2xl bg-gray-50 dark:bg-gray-700 p-4 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
              <div className="mb-2 flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  To
                </span>
                <NetworkSelect
                  value={chainOut}
                  onChange={setChainOut}
                  networks={chains}
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={
                    quoterData
                      ? formatUnits(quoterData[0], tokenOut?.decimals ?? 18)
                      : ""
                  }
                  type="number"
                  className={cn(
                    "border-0 bg-transparent text-3xl font-semibold p-0",
                    "ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                    "hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors",
                  )}
                  placeholder={
                    !!quoterError
                      ? "Insufficient Liquidity"
                      : isQuoterLoading
                        ? "Fetching quote..."
                        : "0.0"
                  }
                  disabled={true}
                />

                <TokenSelect
                  value={tokenOut}
                  onChange={setTokenOut}
                  tokens={tokensOut}
                />
              </div>
              <div className="mt-2 flex justify-end text-sm text-gray-500 dark:text-gray-400">
                {/* TODO: enable if we can get a dollar value <div className="mt-2 flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>$0.00</span> */}
                <div className="space-x-2 align-right">
                  <span>Balance: {tokenOutBalanceFormatted}</span>
                </div>
              </div>
            </div>
          </div>
          <Button
            disabled={
              !(swapStep === SwapStep.APPROVE_PERMIT2 ||
                swapStep === SwapStep.APPROVE_UNISWAP_ROUTER ||
                swapStep === SwapStep.EXECUTE_SWAP)
            }
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-14 text-lg rounded-xl shadow-lg transition-all"
            onClick={() => handleSwapSteps()}
          >
            {swapStep}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
