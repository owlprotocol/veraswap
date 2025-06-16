import { useState, useMemo, useRef, useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { groupBy } from "lodash-es";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Currency, getUniswapV4Address } from "@owlprotocol/veraswap-sdk";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChainWithMetadata } from "@owlprotocol/veraswap-sdk/chains";
import { formatUnits } from "viem";
import { atom } from "jotai";
import { TokenBadge } from "./TokenBadge.js";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog.js";
import { Button } from "@/components/ui/button.js";
import { Input } from "@/components/ui/input.js";
import { cn } from "@/lib/utils.js";
import {
    chainsAtom,
    currencyInAtom,
    currencyOutAtom,
    currenciesAtom,
    chainInAtom,
    chainOutAtom,
} from "@/atoms/index.js";
import { useSyncSwapSearchParams } from "@/hooks/useSyncSwapSearchParams.js";
import {
    currencyBalanceAtomFamily,
    currencyMultichainBalanceAtomFamily,
    currencyMultichainUsdBalanceAtomFamily,
    currencyUsdBalanceAtomFamily,
} from "@/atoms/token-balance.js";
import { accountAtom } from "@/atoms/account.js";

export const TokenSelector = ({
    selectingTokenIn,
    isEmbedded = false,
}: {
    selectingTokenIn?: boolean;
    isEmbedded?: boolean;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);

    const chains = useAtomValue(chainsAtom);
    const allCurrencies = useAtomValue(currenciesAtom);
    const uniqueTokens = useMemo(() => groupBy(allCurrencies, "symbol"), [allCurrencies]);

    useSyncSwapSearchParams(allCurrencies);

    const [currencyIn, setCurrencyIn] = useAtom(currencyInAtom);
    const [currencyOut, setCurrencyOut] = useAtom(currencyOutAtom);
    const chainIn = useAtomValue(chainInAtom);
    const chainOut = useAtomValue(chainOutAtom);
    const chain = selectingTokenIn ? chainIn : chainOut;

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

    const popularTokens = ["ETH", "USDT", "USDC"];

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
                        "h-14 gap-3 pl-4 pr-3.5",
                        "rounded-xl border-2",
                        "shadow-sm hover:shadow-md transition-all",
                    )}
                >
                    {currentToken ? (
                        <>
                            <TokenBadge currency={currentToken} />
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
                className={cn(
                    "rounded-2xl border-0 p-0 gap-0 shadow-xl overflow-hidden",
                    isEmbedded ? "max-w-full max-h-[90vh] w-[95vw]" : "max-w-2xl max-h-[90vh]",
                )}
                showCloseIcon={false}
                aria-describedby={undefined}
            >
                <DialogTitle>
                    <VisuallyHidden>Loading</VisuallyHidden>
                </DialogTitle>
                <div className="p-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or paste address"
                            className="pl-10 bg-muted border-none h-12 text-lg"
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

                <div
                    ref={scrollContainerRef}
                    className={cn(
                        "overflow-y-auto p-4",
                        isEmbedded ? "max-h-[calc(90vh-200px)]" : "max-h-[calc(90vh-250px)]",
                    )}
                >
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
    chains: ChainWithMetadata[];
    onToggle: () => void;
    onSelect: (token: Currency) => void;
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const account = useAtomValue(accountAtom);
    const { balance: totalBalance } = useAtomValue(currencyMultichainBalanceAtomFamily(symbol));
    const totalUsdBalance = useAtomValue(currencyMultichainUsdBalanceAtomFamily(symbol));

    // Inspired from https://github.com/pmndrs/jotai/issues/454#issuecomment-829779749
    const balanceValues = useAtomValue(
        useMemo(
            () =>
                atom((get) => {
                    const balanceAtoms = tokenList.map((token) =>
                        account?.address
                            ? currencyBalanceAtomFamily({ currency: token, account: account.address })
                            : atom(null),
                    );

                    return balanceAtoms.map((atom) => get(atom));
                }),
            [account.address, tokenList],
        ),
    );

    const [tokensWithBalance, tokensWithoutBalance] = useMemo(() => {
        const tokensWithBalance: Currency[] = [];
        const tokensWithoutBalance: Currency[] = [];

        tokenList.forEach((token, index) => {
            const balance = balanceValues[index];
            if (balance?.data && balance.data > 0n) {
                tokensWithBalance.push(token);
            } else {
                tokensWithoutBalance.push(token);
            }
        });

        return [tokensWithBalance, tokensWithoutBalance];
    }, [balanceValues, tokenList]);

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
                        {account?.address && (
                            <>
                                <div className="text-sm text-muted-foreground">
                                    {totalBalance.toFixed(4)} {symbol}
                                </div>
                                {typeof totalUsdBalance === "number" && (
                                    <div className="text-xs text-muted-foreground">${totalUsdBalance.toFixed(2)}</div>
                                )}
                            </>
                        )}
                    </div>
                    {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground ml-2" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground ml-2" />
                    )}
                </div>
            </button>

            {isExpanded && (
                <div className="bg-muted/20 space-y-2 px-4 py-2 animate-in slide-in-from-top duration-200">
                    {account?.address && tokensWithBalance.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {tokensWithBalance.map((token) => {
                                const chain = chains.find((c) => c.id === token.chainId);
                                return (
                                    <ChainTokenBalance
                                        key={token.chainId}
                                        token={token}
                                        chain={chain}
                                        symbol={symbol}
                                        onSelect={onSelect}
                                        hasBalance={true}
                                    />
                                );
                            })}
                        </div>
                    )}

                    {tokensWithoutBalance.length > 0 && (
                        <div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {tokensWithoutBalance.map((token) => {
                                    const chain = chains.find((c) => c.id === token.chainId);
                                    return (
                                        <ChainTokenBalance
                                            key={token.chainId}
                                            token={token}
                                            chain={chain}
                                            symbol={symbol}
                                            onSelect={onSelect}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// TODO: Fix "Warning: Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render."
const ChainTokenBalance = ({
    token,
    chain,
    symbol,
    onSelect,
    hasBalance = false,
}: {
    token: Currency;
    chain?: ChainWithMetadata;
    symbol: string;
    onSelect: (token: Currency) => void;
    hasBalance?: boolean;
}) => {
    const account = useAtomValue(accountAtom);
    const balanceQuery = useAtomValue(
        account?.address ? currencyBalanceAtomFamily({ currency: token, account: account.address }) : atom(null),
    );
    const usdBalance = useAtomValue(
        account?.address ? currencyUsdBalanceAtomFamily({ currency: token, account: account.address }) : atom(0),
    );

    const balanceValue = balanceQuery?.data ?? 0n;
    const decimals = token.decimals ?? 18;
    const balance = Number(formatUnits(balanceValue, decimals));

    const formatUsdBalance = (value: number) => {
        if (value < 0.01) return "<$0.01";
        return `$${value.toFixed(2)}`;
    };

    return (
        <Button
            className="flex h-auto items-center gap-2 p-3 w-full justify-start transition-colors"
            onClick={() => onSelect(token)}
            variant="secondary"
        >
            <div className="flex-1 space-y-1">
                <div className="flex w-full items-center justify-between gap-2">
                    <div className="font-medium text-left">{chain?.name || `Chain ${token.chainId}`}</div>
                    {chain?.custom?.logoURI && (
                        <img
                            src={chain.custom.logoURI}
                            onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
                            alt={chain?.name || `Chain ${token.chainId}`}
                            className="h-5 w-5 rounded-full border"
                        />
                    )}
                </div>
                {hasBalance && (
                    <div className="text-sm truncate text-left text-muted-foreground">
                        {account?.address && (
                            <>
                                <div>
                                    {balance.toFixed(4)} {symbol}
                                </div>
                                {typeof usdBalance === "number" && (
                                    <div className="text-xs">{formatUsdBalance(usdBalance)}</div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </Button>
    );
};
