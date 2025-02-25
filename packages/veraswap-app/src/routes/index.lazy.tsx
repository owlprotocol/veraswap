import { createLazyFileRoute } from "@tanstack/react-router";
import { ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { tokens, networks, Network, Token } from "@/types";
import { NetworkSelect } from "@/components/NetworkSelect";
import { TokenSelect } from "@/components/TokenSelect";
import { cn } from "@/lib/utils";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  const { isConnected, address } = useAccount();
  const [fromChain, setFromChain] = useState<Network | null>(networks[0]);
  const [toChain, setToChain] = useState<Network | null>(null);
  const [token0, setToken0] = useState(tokens[fromChain.id][0]);
  const [token1, setToken1] = useState<Token | null>(null);
  const [sellAmount, setSellAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState("");

  const isNotConnected = !isConnected || !address;

  const getExchangeRate = () => {
    if (!token0 || !token1) return "-";
    const mockRates: Record<string, Record<string, string>> = {
      ETH: { USDC: "2000", USDT: "1995", MATIC: "3000" },
      USDC: { ETH: "0.0005", MATIC: "1.5", ARB: "2.0" },
      MATIC: { USDC: "0.67", ETH: "0.00033" },
      ARB: { USDC: "0.5", ETH: "0.00025" },
    };
    return `1 ${token0.symbol} = ${
      mockRates[token0.symbol]?.[token1.symbol] || "-"
    } ${token1.symbol}`;
  };

  const handleSwap = () => {
    const tempNetwork = fromChain;
    const tempToken = token0;
    const tempAmount = sellAmount;
    setFromChain(toChain!);
    setToken0(token1!);
    setSellAmount(buyAmount);
    setToChain(tempNetwork);
    setToken1(tempToken);
    setBuyAmount(tempAmount);
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
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  type="number"
                  className={cn(
                    "border-0 bg-transparent text-3xl font-semibold p-0",
                    "ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                    "hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                  )}
                  placeholder="0.0"
                />
                <TokenSelect
                  value={token0}
                  onChange={setToken0}
                  tokens={fromChain ? tokens[fromChain.id] : []}
                />
              </div>
              <div className="mt-2 flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>$0.00</span>
                <div className="space-x-2">
                  <span>Balance: 1.234</span>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-sm"
                    onClick={() => setSellAmount("1.234")}
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
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  type="number"
                  placeholder="0.0"
                  className={cn(
                    "border-0 bg-transparent text-3xl font-semibold p-0",
                    "ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                    "hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                  )}
                />
                <TokenSelect
                  value={token1}
                  onChange={setToken1}
                  tokens={toChain ? tokens[toChain.id] : []}
                />
              </div>
              <div className="mt-2 flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>$0.00</span>
                <div className="space-x-2">
                  <span>Balance: 0.00</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Price</span>
              <span>
                {token0 && token1 ? getExchangeRate() : "Select both tokens"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Price Impact</span>
              <span>0.5%</span>
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
