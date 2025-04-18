import { useState, useMemo, useRef, useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { Chain } from "viem";
import { groupBy } from "lodash-es";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Currency, getUniswapV4Address } from "@owlprotocol/veraswap-sdk";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog.js";
import { Button } from "@/components/ui/button.js";
import { Input } from "@/components/ui/input.js";
import { cn } from "@/lib/utils.js";
import { chainsAtom, currencyInAtom, currencyOutAtom, currenciesAtom } from "@/atoms/index.js";
import { useSyncSwapSearchParams } from "@/hooks/useSyncSwapSearchParams.js";
import { currencyBalancesAtom } from "@/atoms/token-balance.js";

export const TokenSelector = ({ selectingTokenIn }: { selectingTokenIn?: boolean }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);

    const chains = useAtomValue(chainsAtom);
    const allCurrencies = useAtomValue(currenciesAtom);
    const uniqueTokens = useMemo(() => groupBy(allCurrencies, "symbol"), [allCurrencies]);

    useSyncSwapSearchParams(allCurrencies);

    const [currencyIn, setCurrencyIn] = useAtom(currencyInAtom);
    const [currencyOut, setCurrencyOut] = useAtom(currencyOutAtom);

    const currentToken = selectingTokenIn ? currencyIn : currencyOut;
    const currentTokenSymbol = currentToken?.symbol || null;

    const filteredTokens = useMemo(() => {
        return Object.entries(uniqueTokens)
            .map(([symbol, tokenList]) => {
                const oppositeToken = selectingTokenIn ? currencyOut : currencyIn;

                const filteredList = oppositeToken
                    ? tokenList.filter(
                          (t) =>
                              !(
                                  getUniswapV4Address(t) === getUniswapV4Address(oppositeToken) &&
                                  t.chainId === oppositeToken.chainId
                              ),
                      )
                    : tokenList;

                const lowerQuery = searchQuery.toLowerCase();
                const matchesQuery =
                    symbol.toLowerCase().includes(lowerQuery) ||
                    (filteredList[0]?.name?.toLowerCase().includes(lowerQuery) ?? false) ||
                    (filteredList[0] ? getUniswapV4Address(filteredList[0]).toLowerCase().includes(lowerQuery) : false);

                return matchesQuery && filteredList.length > 0 ? [symbol, filteredList] : null;
            })
            .filter(Boolean) as [string, Currency[]][];
    }, [uniqueTokens, searchQuery, currencyIn, currencyOut, selectingTokenIn]);

    const popularTokens = ["AAVE", "USDT", "USDC"];

    const handleTokenSelect = (currency: Currency) => {
        if (selectingTokenIn) {
            setCurrencyIn(currency);
        } else {
            setCurrencyOut(currency);
        }
        setExpandedSymbol(null);
        setIsOpen(false);
    };

    const toggleSymbolExpansion = (symbol: string) => {
        setExpandedSymbol((prev) => (prev === symbol ? null : symbol));
    };

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: filteredTokens.length,
        getScrollElement: () => scrollContainerRef.current,
        estimateSize: () => 72,
        overscan: 5,
    });

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                requestAnimationFrame(() => {
                    rowVirtualizer.scrollToIndex(0);
                    rowVirtualizer.measure();
                });
                setIsOpen(open);
                if (!open) setExpandedSymbol(null);
            }}
        >
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
                                src={currentToken.logoURI || "https://etherscan.io/images/main/empty-token.png"}
                                alt={currentToken.symbol}
                                className="h-7 w-7 rounded-full ring-2 ring-gray-100 dark:ring-gray-700"
                                onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
                            />
                            <div>
                                <div className="font-semibold">{currentToken.symbol}</div>
                                <div className="text-xs text-muted-foreground">
                                    {chains.find((c) => c.id === currentToken.chainId)?.name ??
                                        `Chain ${currentToken.chainId}`}
                                </div>
                            </div>
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
                    onExpand={(symbol) => {
                        const index = filteredTokens.findIndex(([s]) => s === symbol);
                        if (index !== -1) {
                            setExpandedSymbol(symbol);
                            requestAnimationFrame(() => {
                                rowVirtualizer.scrollToIndex(index, { align: "start" });
                            });
                        }
                    }}
                />

                <div ref={scrollContainerRef} className="max-h-[350px] overflow-y-auto p-2">
                    {filteredTokens.length === 0 ? (
                        <div className="flex h-full items-center justify-center p-8">
                            <span className="text-muted-foreground">
                                {searchQuery ? "No matching tokens found" : "No tokens available"}
                            </span>
                        </div>
                    ) : (
                        <div className="relative divide-y" style={{ height: rowVirtualizer.getTotalSize() }}>
                            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                                const [symbol, tokenList] = filteredTokens[virtualItem.index];
                                const isExpanded = expandedSymbol === symbol;
                                const isSelected = currentTokenSymbol === symbol;

                                return (
                                    <div
                                        key={virtualItem.key}
                                        className="absolute top-0 left-0 w-full"
                                        style={{
                                            transform: `translateY(${virtualItem.start}px)`,
                                        }}
                                        data-index={virtualItem.index}
                                        ref={(el) => {
                                            if (el) {
                                                rowVirtualizer.measureElement(el);
                                            }
                                        }}
                                    >
                                        <TokenGroup
                                            tokenList={tokenList}
                                            isExpanded={isExpanded}
                                            isSelected={isSelected}
                                            symbol={symbol}
                                            chains={chains}
                                            onToggle={() => {
                                                toggleSymbolExpansion(symbol);
                                            }}
                                            onSelect={handleTokenSelect}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
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
    uniqueTokens: { [symbol: string]: Currency[] };
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
                                src={token.logoURI || "/placeholder.svg"}
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
    tokenList: Currency[];
    isExpanded: boolean;
    isSelected: boolean;
    symbol: string;
    chains: Chain[];
    onToggle: () => void;
    onSelect: (token: Currency) => void;
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const balances = useAtomValue(currencyBalancesAtom);

    const totalBalance = useMemo(
        () => balances.filter((b) => b.currency.symbol === symbol).reduce((sum, b) => sum + (b.balance ?? 0), 0),
        [balances, symbol],
    );

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
                            src={tokenList[0].logoURI || "/placeholder.svg"}
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
                        <div className="text-sm text-muted-foreground">
                            {totalBalance.toFixed(4)} {symbol}
                        </div>
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
                        const balance =
                            balances.find(
                                (b) =>
                                    b.currency.chainId === token.chainId &&
                                    getUniswapV4Address(b.currency) === getUniswapV4Address(token),
                            )?.balance ?? 0;
                        return (
                            <button
                                key={token.chainId}
                                className="flex items-center gap-2 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                                onClick={() => onSelect(token)}
                            >
                                <div className="flex-1">
                                    <div className="font-medium">{chain?.name || `Chain ${token.chainId}`}</div>
                                    <div className="text-xs text-muted-foreground truncate">
                                        {balance.toFixed(4)} {symbol}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                        {getUniswapV4Address(token).substring(0, 6)}...
                                        {getUniswapV4Address(token).substring(getUniswapV4Address(token).length - 4)}
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
