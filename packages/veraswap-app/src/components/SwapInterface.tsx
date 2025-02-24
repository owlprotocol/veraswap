import { ArrowDown, ChevronDown, Search, Check } from "lucide-react";
import { useState } from "react";
import { useAccount } from "wagmi";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Card, CardContent } from "./ui/card";
import { Currency } from "@uniswap/sdk-core";

interface Token {
  symbol: string;
  name: string;
  logo: string;
}

interface Network {
  id: string;
  name: string;
  logo: string;
}

const networks: Network[] = [
  {
    id: "ethereum",
    name: "Ethereum",
    logo: "/placeholder.svg",
  },
  {
    id: "polygon",
    name: "Polygon",
    logo: "/placeholder.svg",
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    logo: "/placeholder.svg",
  },
];

const tokens: { [networkId: string]: Token[] } = {
  ethereum: [
    {
      symbol: "ETH",
      name: "Ethereum",
      logo: "/placeholder.svg",
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      logo: "/placeholder.svg",
    },
    {
      symbol: "USDT",
      name: "Tether",
      logo: "/placeholder.svg",
    },
  ],
  polygon: [
    {
      symbol: "MATIC",
      name: "Polygon",
      logo: "/placeholder.svg",
    },
    {
      symbol: "USDC",
      name: "USD Coin (Polygon)",
      logo: "/placeholder.svg",
    },
  ],
  arbitrum: [
    {
      symbol: "ARB",
      name: "Arbitrum",
      logo: "/placeholder.svg",
    },
    {
      symbol: "USDC",
      name: "USD Coin (Arbitrum)",
      logo: "/placeholder.svg",
    },
  ],
};

export function SwapInterface() {
  const { isConnected, address } = useAccount();
  const [sellNetwork, setSellNetwork] = useState(networks[0]);
  const [buyNetwork, setBuyNetwork] = useState<Network | null>(null);
  const [sellToken, setSellToken] = useState(tokens[sellNetwork.id][0]);
  const [buyToken, setBuyToken] = useState<Token | null>(null);
  const [sellAmount, setSellAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState("");

  const isNotConnected = !isConnected || !address;

  const getExchangeRate = () => {
    if (!sellToken || !buyToken) return "-";
    const mockRates: Record<string, Record<string, string>> = {
      ETH: { USDC: "2000", USDT: "1995", MATIC: "3000" },
      USDC: { ETH: "0.0005", MATIC: "1.5", ARB: "2.0" },
      MATIC: { USDC: "0.67", ETH: "0.00033" },
      ARB: { USDC: "0.5", ETH: "0.00025" },
    };
    return `1 ${sellToken.symbol} = ${
      mockRates[sellToken.symbol]?.[buyToken.symbol] || "-"
    } ${buyToken.symbol}`;
  };

  const handleSellNetworkChange = (newNetwork: Network) => {
    setSellNetwork(newNetwork);
    setSellToken(tokens[newNetwork.id][0]);
  };

  const handleBuyNetworkChange = (newNetwork: Network) => {
    setBuyNetwork(newNetwork);
    setBuyToken(null);
  };

  const handleSwap = () => {
    const tempNetwork = sellNetwork;
    const tempToken = sellToken;
    setSellNetwork(buyNetwork!);
    setSellToken(buyToken!);
    setBuyNetwork(tempNetwork);
    setBuyToken(tempToken);
  };

  const handleSellAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSellAmount(e.target.value);
    setBuyAmount("");
  };

  const handleBuyAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBuyAmount(e.target.value);
    setSellAmount("");
  };

  const getButtonText = () => {
    if (isNotConnected) return "Connect Wallet";
    if (!buyNetwork) return "Select Buy Network";
    if (!buyToken) return "Select Buy Token";
    return "Review Swap";
  };

  return (
    <>
      <div className=" overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-32 w-32 rounded-full bg-purple-200 dark:bg-purple-900 blur-3xl opacity-20" />
        <div className="absolute right-1/4 top-1/2 h-32 w-32 rounded-full bg-blue-200 dark:bg-blue-900 blur-3xl opacity-20" />
        <div className="absolute bottom-1/4 left-1/2 h-32 w-32 rounded-full bg-indigo-200 dark:bg-indigo-900 blur-3xl opacity-20" />
      </div>
      <div className="relative mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center p-4">
        <h1 className="mb-8 text-center text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          VeraSwap
        </h1>
        <Card className="w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="rounded-2xl bg-gray-50 dark:bg-gray-700 p-4 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                <div className="mb-2 flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Sell
                  </span>
                  <NetworkSelect
                    value={sellNetwork}
                    onChange={handleSellNetworkChange}
                    networks={networks}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={sellAmount}
                    onChange={handleSellAmountChange}
                    type="number"
                    placeholder="0.0"
                    className="border-0 bg-transparent text-4xl font-semibold"
                  />
                  <TokenSelect
                    value={sellToken}
                    onChange={setSellToken}
                    tokens={tokens[sellNetwork.id]}
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
                >
                  <ArrowDown className="h-6 w-6" />
                </Button>
              </div>

              <div className="rounded-2xl bg-gray-50 dark:bg-gray-700 p-4 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                <div className="mb-2 flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Buy
                  </span>
                  <NetworkSelect
                    value={buyNetwork}
                    onChange={handleBuyNetworkChange}
                    networks={networks}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={buyAmount}
                    onChange={handleBuyAmountChange}
                    type="number"
                    placeholder="0.0"
                    className="border-0 bg-transparent text-4xl font-semibold"
                  />
                  <TokenSelect
                    value={buyToken}
                    onChange={setBuyToken}
                    tokens={buyNetwork ? tokens[buyNetwork.id] : []}
                  />
                </div>
                <div className="mt-2 flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>$0.00</span>
                  <div className="space-x-2">
                    <span>Balance: 0.00</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Price</span>
                  <span>
                    {sellToken && buyToken
                      ? getExchangeRate()
                      : "Select both tokens"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Price Impact</span>
                </div>
              </div>

              <Button
                disabled={isNotConnected || !buyNetwork || !buyToken}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-14 text-lg rounded-full shadow-lg transition-all"
              >
                {getButtonText()}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function NetworkSelect({
  value,
  onChange,
  networks,
}: {
  value: Network | null;
  onChange: (network: Network) => void;
  networks: Network[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2 pl-3 pr-3 bg-white dark:bg-gray-700"
        >
          {value ? (
            <>
              <img
                src={value.logo}
                alt={value.name}
                className="h-4 w-4 rounded-full"
              />
              <span className="text-xs">{value.name}</span>
            </>
          ) : (
            <span className="text-xs">Select Network</span>
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xs rounded-2xl">
        <DialogHeader>
          <DialogTitle>Select Network</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px]">
          <div className="space-y-1">
            {networks.map((network) => (
              <Button
                key={network.id}
                variant="ghost"
                className="w-full justify-start gap-3 px-4 py-3"
                onClick={() => {
                  onChange(network);
                  setOpen(false);
                }}
              >
                <img
                  src={network.logo}
                  alt={network.name}
                  className="h-6 w-6 rounded-full"
                />
                <span>{network.name}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function TokenSelect({
  value,
  onChange,
  tokens,
}: {
  value: Token | null;
  onChange: (token: Token) => void;
  tokens: Token[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-14 gap-3 pl-3 pr-3 bg-white dark:bg-gray-700"
        >
          {value ? (
            <>
              <img
                src={value.logo}
                alt={value.symbol}
                className="h-6 w-6 rounded-full"
              />
              <span className="font-medium">{value.symbol}</span>
            </>
          ) : (
            <span>Select Token</span>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xs rounded-2xl">
        <DialogHeader>
          <DialogTitle>Select Token</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-500" />
          <Input
            className="pl-9 h-12 rounded-xl"
            placeholder="Search token..."
          />
        </div>
        <ScrollArea className="h-[300px]">
          <div className="space-y-1">
            {tokens.map((token) => (
              <Button
                key={token.symbol}
                variant={value?.symbol === token.symbol ? "secondary" : "ghost"}
                className="w-full justify-between px-4 py-4 rounded-xl"
                onClick={() => {
                  onChange(token);
                  setOpen(false);
                }}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={token.logo}
                    alt={token.symbol}
                    className="h-8 w-8 rounded-full"
                  />
                  <div className="text-left">
                    <div className="font-medium">{token.symbol}</div>
                    <div className="text-xs text-gray-500">{token.name}</div>
                  </div>
                </div>
                {value?.symbol === token.symbol && (
                  <Check className="h-5 w-5 text-green-500" />
                )}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
