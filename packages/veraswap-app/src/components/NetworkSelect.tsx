import { ChevronDown, Search, Check } from "lucide-react";
import { useState } from "react";
import { Chain } from "viem";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

export function NetworkSelect({
    value,
    onChange,
    networks,
}: {
    value: Chain | null;
    onChange: (network: Chain) => void;
    networks: Chain[];
}) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = "/placeholder.jpg";
    };

    const filteredNetworks = networks.filter(
        (network) =>
            network.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            network.id.toString().includes(searchQuery),
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "h-10 gap-2.5 pl-3.5 pr-3 bg-white dark:bg-gray-800",
                        "hover:bg-gray-50 dark:hover:bg-gray-700/80 transition-colors",
                        "rounded-xl border-2 border-gray-100 dark:border-gray-700",
                        "hover:border-gray-200 dark:hover:border-gray-600",
                        "shadow-sm hover:shadow-md transition-all",
                    )}
                >
                    {value ? (
                        <>
                            {/* <img
                src={value.logo}
                alt={value.name}
                className="h-5 w-5 rounded-full ring-2 ring-gray-100 dark:ring-gray-700"
                onError={handleImageError}
              /> */}
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{value.name}</span>
                        </>
                    ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">Select Network</span>
                    )}
                    <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 ml-1" />
                </Button>
            </DialogTrigger>

            <DialogContent
                className="max-w-xs max-h-[80vh] rounded-2xl border-0 bg-background shadow-xl backdrop-blur-sm dark:backdrop-blur-lg flex flex-col"
                aria-describedby={undefined}
            >
                <DialogHeader className="px-2">
                    <DialogTitle className="text-left text-lg font-semibold">Select Network</DialogTitle>
                </DialogHeader>

                <div className="relative px-2">
                    <Search className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        className="h-12 rounded-xl pl-11 pr-4 text-base focus-visible:ring-2"
                        placeholder="Search networks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <ScrollArea className="flex-1 overflow-y-auto px-2">
                    {filteredNetworks.length > 0 ? (
                        <div className="space-y-1.5 pb-2">
                            {filteredNetworks.map((network) => (
                                <Button
                                    key={network.id}
                                    variant="ghost"
                                    className={cn(
                                        "group h-14 w-full justify-between px-4 py-3",
                                        "rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-gray-700/50",
                                        "active:scale-[0.98]",
                                        value?.id === network.id && "bg-gray-100 dark:bg-gray-700",
                                    )}
                                    onClick={() => {
                                        onChange(network);
                                        setOpen(false);
                                    }}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* <img
                      alt={network.name}
                      className="h-8 w-8 rounded-full ring-2 ring-gray-200 dark:ring-gray-600"
                      onError={handleImageError}
                    /> */}
                                        <div className="text-left">
                                            <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                                                {network.name}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                Chain ID: {network.id}
                                            </div>
                                        </div>
                                    </div>
                                    {value?.id === network.id && (
                                        <Check className="h-5 w-5 text-green-500 animate-in fade-in" />
                                    )}
                                </Button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex justify-center items-center h-40 text-gray-500 dark:text-gray-400">
                            No networks found
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
