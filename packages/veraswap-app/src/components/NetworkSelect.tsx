import { Network } from "@/types";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

export function NetworkSelect({
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
