import { createLazyFileRoute } from "@tanstack/react-router";
import { ArrowUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useAccount, useConfig, useReadContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { networks, Network, Token as TokenCustom } from "@/types";
import { CurrencyAmount, Token } from "@uniswap/sdk-core";
import { NetworkSelect } from "@/components/NetworkSelect";
import { TokenSelect } from "@/components/TokenSelect";
import { cn } from "@/lib/utils";
import {
  MOCK_POOLS,
  MOCK_TOKENS,
  quoteQueryOptions,
  tokenDataQueryOptions,
  UNISWAP_CONTRACTS,
} from "@owlprotocol/veraswap-sdk";
import { MockERC20 } from "@/artifacts/MockERC20";
import { formatUnits, parseUnits, zeroAddress } from "viem";
import { useQuery } from "@tanstack/react-query";

const emptyToken = new Token(1, zeroAddress, 1);
const emptyCurrencyAmount = CurrencyAmount.fromRawAmount(emptyToken, 1);

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  const { isConnected, address: walletAddress } = useAccount();
  const [fromChain, setFromChain] = useState<Network | null>(networks[0]);
  const [toChain, setToChain] = useState<Network | null>(null);
  const [token0, setToken0] = useState<TokenCustom | null>(null);
  const [token1, setToken1] = useState<TokenCustom | null>(null);
  const [amountIn, setAmountIn] = useState<bigint | undefined>(undefined);
  const [amountOut, setAmountOut] = useState<bigint | undefined>(undefined);

  const isNotConnected = !isConnected || !walletAddress;

  let tokens: Record<string, TokenCustom[]> = {};

  Object.keys(MOCK_TOKENS).forEach((chainId) => {
    tokens[chainId] = Object.keys(MOCK_TOKENS[chainId]).map((token) => ({
      address: MOCK_TOKENS[chainId][token],
      name: token,
      symbol: token,
      decimals: 18,
    }));
  });

  const config = useConfig();

  // const token0Uniswap: Token = {address: token0?.address, decimals: token0?.decimals, symbol: token0?.symbol, name: token0?.name}
  const { data: token0Data } = useQuery({
    ...tokenDataQueryOptions(config, {
      address: token0?.address ?? zeroAddress,
      chainId: Number(fromChain?.id ?? 0),
      ...token0,
    }),
    enabled: !!token0,
  });
  const token0Uniswap: Token | undefined =
    fromChain && token0 && token0Data
      ? new Token(
          Number(fromChain.id),
          token0.address,
          token0Data.decimals ?? 18,
          token0Data.symbol
        )
      : undefined;

  const { data: token0Balance } = useReadContract({
    abi: MockERC20.abi,
    chainId: 1337,
    address: token0?.address,
    functionName: "balanceOf",
    args: [walletAddress!],
    query: { enabled: !!token0 && !!walletAddress },
  });

  const token0BalanceFromatted =
    token0Balance && token0
      ? `
     ${formatUnits(token0Balance, token0.decimals ?? 18)} ${token0.symbol}`
      : "-";

  const { data: token1Balance } = useReadContract({
    abi: MockERC20.abi,
    chainId: 1337,
    address: token1?.address,
    functionName: "balanceOf",
    args: [walletAddress!],
    query: { enabled: !!token1 && !!walletAddress },
  });

  const token1BalanceFormatted =
    token1Balance && token1
      ? `
     ${formatUnits(token1Balance, token1.decimals ?? 18)} ${token1.symbol}`
      : "-";

  const {
    data: quoterData,
    error: quoterError,
    isLoading: isQuoterLoading,
  } = useQuery({
    ...quoteQueryOptions(config, {
      chainId: Number(toChain?.id ?? 0),
      exactCurrencyAmount:
        !!amountIn && token0Uniswap
          ? CurrencyAmount.fromRawAmount(token0Uniswap, amountIn.toString())
          : emptyCurrencyAmount,
      poolKey: MOCK_POOLS[fromChain?.id ?? 0],
      quoteType: "quoteExactInputSingle",
      quoterAddress: !!fromChain
        ? UNISWAP_CONTRACTS[fromChain.id].QUOTER
        : zeroAddress,
    }),
    enabled: !!amountIn && !!toChain,
  });

  useEffect(() => {
    if (quoterData) {
      const amountOutQuoted = quoterData[0];
      setAmountOut(amountOutQuoted);
      return;
    }

    if (quoterError) {
      setAmountOut(undefined);
    }
  }, [quoterData, quoterError]);

  const handleSwap = () => {
    const tempNetwork = fromChain;
    const tempToken = token0;
    const tempAmount = amountIn;
    setFromChain(toChain!);
    setToken0(token1!);
    setAmountIn(amountOut);
    setToChain(tempNetwork);
    setToken1(tempToken);
    setAmountOut(tempAmount);
  };

  const getButtonText = () => {
    if (isNotConnected) return "Connect Wallet";
    if (!toChain) return "Select A Network";
    if (!token1) return "Select Buy Token";
    return "Review Swap";
  };

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
                  value={fromChain}
                  onChange={setFromChain}
                  networks={networks}
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={
                    amountIn
                      ? formatUnits(amountIn, token0?.decimals ?? 18)
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    // TODO: get sell quote value
                    setAmountIn(
                      value === ""
                        ? undefined
                        : parseUnits(value, token0?.decimals ?? 18)
                    );
                  }}
                  type="number"
                  className={cn(
                    "border-0 bg-transparent text-3xl font-semibold p-0",
                    "ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                    "hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                  )}
                  placeholder="0.0"
                  disabled={!fromChain || !token0}
                />
                <TokenSelect
                  value={token0}
                  onChange={setToken0}
                  tokens={
                    fromChain && tokens[fromChain.id]
                      ? tokens[fromChain.id]
                      : []
                  }
                />
              </div>
              <div className="mt-2 flex justify-end text-sm text-gray-500 dark:text-gray-400">
                {/* TODO: enable if we can get a dollar value <div className="mt-2 flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>$0.00</span> */}
                <div className="space-x-2">
                  <span>Balance: {token0BalanceFromatted}</span>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-sm"
                    onClick={() => token0Balance && setAmountIn(token0Balance)}
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
                onClick={handleSwap}
                disabled={!toChain || !token1}
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
                  value={toChain}
                  onChange={setToChain}
                  networks={networks}
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={
                    amountOut
                      ? formatUnits(amountOut, token1?.decimals ?? 18)
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    setAmountOut(
                      value === ""
                        ? undefined
                        : parseUnits(value, token1?.decimals ?? 18)
                    );
                  }}
                  type="number"
                  className={cn(
                    "border-0 bg-transparent text-3xl font-semibold p-0",
                    "ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                    "hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                  )}
                  placeholder={
                    quoterError
                      ? "Error getting quote"
                      : isQuoterLoading
                        ? "Fetching quote..."
                        : "0.0"
                  }
                  disabled={!toChain || !token1}
                />

                <TokenSelect
                  value={token1}
                  onChange={setToken1}
                  tokens={
                    toChain && tokens[toChain.id] ? tokens[toChain.id] : []
                  }
                />
              </div>
              <div className="mt-2 flex justify-end text-sm text-gray-500 dark:text-gray-400">
                {/* TODO: enable if we can get a dollar value <div className="mt-2 flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>$0.00</span> */}
                <div className="space-x-2 align-right">
                  <span>Balance: {token1BalanceFormatted}</span>
                </div>
              </div>
            </div>
          </div>
          <Button
            disabled={isNotConnected || !toChain || !token1}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-14 text-lg rounded-xl shadow-lg transition-all"
          >
            {getButtonText()}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
