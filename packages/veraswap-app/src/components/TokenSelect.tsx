import { Token } from "@/types";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { ChevronDown, Search, Check } from "lucide-react";
import { Input } from "./ui/input";

export function TokenSelect({
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
