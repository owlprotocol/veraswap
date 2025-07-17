import { useState } from "react";
import { Plus, Trash } from "lucide-react";
import { useAtomValue } from "jotai";
import { type ChainWithMetadata } from "@owlprotocol/veraswap-sdk/chains";
import { Token } from "@owlprotocol/veraswap-sdk";
import { Address, isAddress } from "viem";
import { Button } from "@/components/ui/button.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.js";
import { Input } from "@/components/ui/input.js";
import { useToast } from "@/components/ui/use-toast.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.js";
import { chainsAtom } from "@/atoms/chains.js";

export function CustomTokenManager({
    tokens,
    onTokensChange,
}: {
    tokens: Token[];
    onTokensChange: (tokens: Token[]) => void;
}) {
    const { toast } = useToast();
    const chains = useAtomValue<ChainWithMetadata[]>(chainsAtom);

    const [newToken, setNewToken] = useState({
        address: "",
        chainId: chains[0].id,
        symbol: "",
        name: "",
        decimals: 18,
        logoURI: "",
    });

    const addCustomToken = () => {
        if (!newToken.address || !newToken.symbol || !newToken.name || !newToken.chainId || !newToken.decimals) {
            toast({
                title: "Invalid token",
                description: "Please fill in all required fields for custom token",
                variant: "destructive",
            });
            return;
        }

        if (!isAddress(newToken.address)) {
            toast({
                title: "Invalid address",
                description: "Please enter a valid Ethereum address",
                variant: "destructive",
            });
            return;
        }

        const token = new Token({
            address: newToken.address as Address,
            chainId: newToken.chainId,
            symbol: newToken.symbol,
            name: newToken.name,
            decimals: newToken.decimals,
            logoURI: newToken.logoURI,
        });

        onTokensChange([...tokens, token]);
        setNewToken({
            address: "",
            chainId: chains[0].id,
            symbol: "",
            name: "",
            decimals: 18,
            logoURI: "",
        });
    };

    const removeCustomToken = (index: number) => {
        onTokensChange(tokens.filter((_, i) => i !== index));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Custom Tokens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Token Address</label>
                            <Input
                                placeholder="0x..."
                                value={newToken.address}
                                onChange={(e) => setNewToken((prev) => ({ ...prev, address: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Network</label>
                            <Select
                                value={newToken.chainId.toString()}
                                onValueChange={(value) =>
                                    setNewToken((prev) => ({ ...prev, chainId: parseInt(value) }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Chain" />
                                </SelectTrigger>
                                <SelectContent>
                                    {chains.map((chain) => (
                                        <SelectItem key={chain.id} value={chain.id.toString()}>
                                            {chain.name} ({chain.id})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Symbol</label>
                            <Input
                                placeholder="e.g. USDC"
                                value={newToken.symbol}
                                onChange={(e) => setNewToken((prev) => ({ ...prev, symbol: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input
                                placeholder="e.g. USD Coin"
                                value={newToken.name}
                                onChange={(e) => setNewToken((prev) => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Decimals</label>
                            <Input
                                placeholder="e.g. 18"
                                type="number"
                                value={newToken.decimals}
                                onChange={(e) =>
                                    setNewToken((prev) => ({ ...prev, decimals: parseInt(e.target.value) }))
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Logo URI (Optional)</label>
                            <Input
                                placeholder="https://..."
                                value={newToken.logoURI}
                                onChange={(e) => setNewToken((prev) => ({ ...prev, logoURI: e.target.value }))}
                            />
                        </div>
                    </div>
                    <Button onClick={addCustomToken} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Token
                    </Button>
                </div>

                <div className="space-y-2">
                    {tokens.map((token, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <div>
                                <div className="font-medium">
                                    {token.symbol} ({token.name} - {token.chainId})
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Chain: {chains.find((c) => c.id === token.chainId)?.name ?? token.chainId}
                                </div>
                                <div className="text-sm text-muted-foreground font-mono">{token.address}</div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeCustomToken(index)}>
                                <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
