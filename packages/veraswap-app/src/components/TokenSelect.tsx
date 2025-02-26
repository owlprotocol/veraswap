import { useState } from "react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { ChevronDown, Search, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Token } from "@/types";
import { cn } from "@/lib/utils";
import { TokenAtomData } from "@/atoms";

export function TokenSelect({
  value,
  onChange,
  tokens,
}: {
  value: TokenAtomData | null;
  onChange: (token: TokenAtomData) => void;
  tokens: TokenAtomData[];
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTokens = tokens.filter(
    (token) =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    e.currentTarget.src = "/placeholder.jpg";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          {value ? (
            <>
              <img
                src={value.logo ?? "/placeholder.jpg"}
                alt={value.symbol}
                className="h-7 w-7 rounded-full ring-2 ring-gray-100 dark:ring-gray-700"
                onError={handleImageError}
              />
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {value.symbol}
              </span>
            </>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">
              Select Token
            </span>
          )}
          <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-w-xs rounded-2xl border-0 bg-background shadow-xl backdrop-blur-sm dark:backdrop-blur-lg"
        aria-describedby={undefined}
      >
        <DialogHeader className="px-2">
          <DialogTitle className="text-left text-lg font-semibold">
            Select a token
          </DialogTitle>
        </DialogHeader>

        <div className="relative px-2">
          <Search className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            className="h-12 rounded-xl pl-11 pr-4 text-base focus-visible:ring-2"
            placeholder="Search name or symbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <ScrollArea className="custom-scrollbar h-[360px] px-2">
          <div className="space-y-1.5 pb-2">
            {filteredTokens.map((token) => (
              <Button
                key={token.symbol}
                variant="ghost"
                className={cn(
                  "group h-16 w-full justify-between px-4 py-3",
                  "rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-gray-700/50",
                  "active:scale-[0.98]",
                  value?.symbol === token.symbol &&
                  "bg-gray-100 dark:bg-gray-700",
                )}
                onClick={() => {
                  onChange(token);
                  setOpen(false);
                }}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={token.logo ?? "/placeholder.jpg"}
                    alt={token.symbol}
                    className="h-9 w-9 rounded-full ring-2 ring-gray-200 dark:ring-gray-600"
                    onError={handleImageError}
                  />
                  <div className="text-left">
                    <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {token.symbol}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {token.name}
                    </div>
                  </div>
                </div>
                {value?.symbol === token.symbol && (
                  <Check className="h-5 w-5 text-green-500 animate-in fade-in" />
                )}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
