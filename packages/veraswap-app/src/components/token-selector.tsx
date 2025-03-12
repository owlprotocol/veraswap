import { useState, useMemo, useRef, useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { Chain } from "viem";
import { groupBy } from "lodash-es";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TokenWithChainId } from "@/types";
import { chainsAtom, tokensInAtom, tokenInAtom, tokenOutAtom } from "@/atoms";

export const TokenSelector = ({ selectingTokenIn }: { selectingTokenIn?: boolean }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);

    const chains = useAtomValue(chainsAtom);
    const allTokens = useAtomValue(tokensInAtom);
    const uniqueTokens = useMemo(() => groupBy(allTokens, "symbol"), [allTokens]);

    const [tokenIn, setTokenIn] = useAtom(tokenInAtom);
    const [tokenOut, setTokenOut] = useAtom(tokenOutAtom);

    const currentToken = selectingTokenIn ? tokenIn : tokenOut;
    const currentTokenSymbol = currentToken?.symbol || null;

    const filteredTokens = useMemo(() => {
        return Object.entries(uniqueTokens).filter(([symbol, tokenList]) => {
            const oppositeToken = selectingTokenIn ? tokenOut : tokenIn;
            if (oppositeToken && tokenList.some((t) => t.address === oppositeToken.address)) return false;

            const lowerQuery = searchQuery.toLowerCase();
            return (
                symbol.toLowerCase().includes(lowerQuery) ||
                tokenList[0].name.toLowerCase().includes(lowerQuery) ||
                tokenList[0].address.toLowerCase().includes(lowerQuery)
            );
        });
    }, [uniqueTokens, searchQuery, tokenIn, tokenOut, selectingTokenIn]);

    const popularTokens = ["AAVE", "USDT", "USDC"];

    const handleTokenSelect = (token: TokenWithChainId) => {
        if (selectingTokenIn) {
            setTokenIn(token);
        } else {
            setTokenOut(token);
        }
        setExpandedSymbol(null);
        setIsOpen(false);
    };

    const toggleSymbolExpansion = (symbol: string) => {
        setExpandedSymbol((prev) => (prev === symbol ? null : symbol));
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "h-14 gap-3 pl-4 pr-3.5 bg-white dark:bg-gray-800",
                        "hover:bg-gray-50 dark:hover:bg-gray-700/80 transition-colors",
                        "rounded-xl border-2 border-gray-100 dark:border-gray-700",
                        "hover:border-gray-200 dark:hover:border-gray-600",
                        "shadow-sm hover:shadow-md transition-all",
                    )}
                >
                    {currentToken ? (
                        <>
                            <img
                                src={currentToken.logo || "https://etherscan.io/images/main/empty-token.png"}
                                alt={currentToken.symbol}
                                className="h-7 w-7 rounded-full ring-2 ring-gray-100 dark:ring-gray-700"
                                onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
                            />
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {currentToken.symbol}
                            </span>
                        </>
                    ) : (
                        <span className="text-gray-500 dark:text-gray-400">Select Token</span>
                    )}
                    <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </Button>
            </DialogTrigger>

            <DialogContent
                className="max-w-md max-h-[500px] rounded-2xl border-0 p-0 gap-0 shadow-xl backdrop-blur-sm dark:backdrop-blur-lg overflow-hidden"
                showCloseIcon={false}
                aria-describedby={undefined}
            >
                <DialogTitle>
                    <VisuallyHidden>Loading</VisuallyHidden>
                </DialogTitle>
                <div className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or paste address"
                            className="pl-10 bg-muted border-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <PopularTokens
                    popularTokens={popularTokens}
                    uniqueTokens={uniqueTokens}
                    onExpand={(symbol) => toggleSymbolExpansion(symbol)}
                />

                <div className="max-h-[350px] overflow-y-auto p-2">
                    <div className="divide-y">
                        {filteredTokens.map(([symbol, tokenList]) => {
                            const isExpanded = expandedSymbol === symbol;
                            const isSelected = currentTokenSymbol === symbol;

                            return (
                                <TokenGroup
                                    key={symbol}
                                    tokenList={tokenList}
                                    isExpanded={isExpanded}
                                    isSelected={isSelected}
                                    symbol={symbol}
                                    chains={chains}
                                    onToggle={() => toggleSymbolExpansion(symbol)}
                                    onSelect={handleTokenSelect}
                                />
                            );
                        })}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const PopularTokens = ({
    popularTokens,
    uniqueTokens,
    onExpand,
}: {
    popularTokens: string[];
    uniqueTokens: { [symbol: string]: TokenWithChainId[] };
    onExpand: (symbol: string) => void;
}) => {
    return (
        <div className="px-4 pb-4 grid grid-cols-4 gap-2">
            {popularTokens.map((symbol) => {
                const token = uniqueTokens[symbol]?.[0];
                if (!token) return null;

                return (
                    <button
                        key={symbol}
                        className="flex items-center gap-2 p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                        onClick={() => onExpand(symbol)}
                    >
                        <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                            <img
                                src={token.logo || "/placeholder.svg"}
                                alt={token.symbol}
                                className="w-full h-full object-cover"
                                onError={(e) =>
                                    (e.currentTarget.src = "https://etherscan.io/images/main/empty-token.png")
                                }
                            />
                        </div>
                        <span className="font-medium">{token.symbol}</span>
                    </button>
                );
            })}
        </div>
    );
};

const TokenGroup = ({
    tokenList,
    isExpanded,
    isSelected,
    symbol,
    chains,
    onToggle,
    onSelect,
}: {
    tokenList: TokenWithChainId[];
    isExpanded: boolean;
    isSelected: boolean;
    symbol: string;
    chains: Chain[];
    onToggle: () => void;
    onSelect: (token: TokenWithChainId) => void;
}) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isExpanded && ref.current) {
            ref.current.scrollIntoView({
                behavior: "auto",
                block: "nearest",
            });
        }
    }, [isExpanded]);

    return (
        <div ref={ref}>
            <button
                className={cn(
                    "w-full p-4 flex items-center hover:bg-muted/50 transition-colors",
                    isSelected && "bg-muted/30",
                )}
                onClick={onToggle}
            >
                <div className="flex-1 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        <img
                            src={tokenList[0].logo || "/placeholder.svg"}
                            alt={symbol}
                            className="w-full h-full object-cover"
                            onError={(e) => (e.currentTarget.src = "https://etherscan.io/images/main/empty-token.png")}
                        />
                    </div>
                    <div className="text-left">
                        <div className="font-medium">{tokenList[0].name}</div>
                        <div className="text-sm text-muted-foreground">{tokenList.length} networks</div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <div className="text-right">
                        <div className="font-medium">$0.00</div>
                        <div className="text-sm text-muted-foreground">0 {symbol}</div>
                    </div>
                    {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground ml-2" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground ml-2" />
                    )}
                </div>
            </button>

            {isExpanded && (
                <div className="bg-muted/20 px-4 py-2 grid grid-cols-2 gap-2 animate-in slide-in-from-top duration-200">
                    {tokenList.map((token) => {
                        const chain = chains.find((c) => c.id === token.chainId);
                        return (
                            <button
                                key={token.chainId}
                                className="flex items-center gap-2 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                                onClick={() => onSelect(token)}
                            >
                                <div className="flex-1">
                                    <div className="font-medium">{chain?.name || `Chain ${token.chainId}`}</div>
                                    <div className="text-xs text-muted-foreground truncate">
                                        {token.address.substring(0, 6)}...
                                        {token.address.substring(token.address.length - 4)}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
