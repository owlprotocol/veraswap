import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Copy, ExternalLink, Sun, Moon, Loader2 } from "lucide-react";
import { Token } from "@owlprotocol/veraswap-sdk";
import { Button } from "@/components/ui/button.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.js";
import { Input } from "@/components/ui/input.js";
import { useToast } from "@/components/ui/use-toast.js";
import { useTheme } from "@/components/theme-provider.js";
import { Switch } from "@/components/ui/switch.js";
import { CustomTokenManager } from "@/components/CustomTokenManager.js";

export const Route = createFileRoute("/preview")({
    component: EmbedPreview,
});

const THEME_CONFIG = [
    // Page Background
    {
        key: "background",
        label: "Page Background",
        description: "Background color behind the widget",
    },
    // Main Card
    { key: "card", label: "Widget Background", description: "Main widget card background (also used for modals)" },
    {
        key: "card-foreground",
        label: "Widget Text",
        description: "Primary text color in the widget (also used for modals)",
    },
    // Token Inputs (inner cards + input in modal)
    {
        key: "muted",
        label: "Token Input Background",
        description: "Background of token input areas (From/To sections)",
    },
    { key: "muted-foreground", label: "Input Labels", description: "Labels like 'From', 'To', 'Balance', USD values" },
    // Connect/Swap button
    { key: "primary", label: "Main Action Button", description: "Background of the main action button" },
    { key: "primary-foreground", label: "Action Button Text", description: "Text color on the main action button" },
    // Other buttons
    { key: "secondary", label: "Interactive Buttons", description: "Token selector and swap direction buttons" },
    {
        key: "secondary-foreground",
        label: "Interactive Button Text",
        description: "Text color on interactive buttons",
    },
    // Border
    { key: "border", label: "Borders", description: "Border colors" },
];

const THEME_GROUPS = [
    {
        title: "Page",
        fields: ["background"],
    },
    {
        title: "Widget Container",
        fields: ["card", "card-foreground"],
    },
    {
        title: "Token Input Areas",
        fields: ["muted", "muted-foreground"],
    },
    {
        title: "Main Action Button",
        fields: ["primary", "primary-foreground"],
    },
    {
        title: "Interactive Buttons",
        fields: ["secondary", "secondary-foreground"],
    },
    {
        title: "Borders",
        fields: ["border"],
    },
];

function EmbedPreview() {
    const [hexTheme, setHexTheme] = useState<Record<string, string>>({});
    const [embedUrl, setEmbedUrl] = useState("");
    const { toast } = useToast();
    const { theme } = useTheme();
    const [mode, setMode] = useState<"light" | "dark">(theme === "dark" || theme === "light" ? theme : "light");
    const [currencyIn, setCurrencyIn] = useState<string | undefined>(undefined);
    const [chainIdIn, setChainIdIn] = useState<number | undefined>(undefined);
    const [currencyOut, setCurrencyOut] = useState<string | undefined>(undefined);
    const [chainIdOut, setChainIdOut] = useState<number | undefined>(undefined);
    const [customTokens, setCustomTokens] = useState<Token[]>([]);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [iframeLoaded, setIframeLoaded] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams();
        Object.entries(hexTheme).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });
        if (hexTheme["card"]) {
            hexTheme["modal"] = hexTheme["card"];
            params.set("modal", hexTheme["card"]);
        }
        if (hexTheme["card-foreground"]) {
            hexTheme["modal-foreground"] = hexTheme["card-foreground"];
            params.set("modal-foreground", hexTheme["card-foreground"]);
        }
        if (mode) {
            params.set("mode", mode);
        }
        if (currencyIn) params.set("currencyIn", currencyIn);
        if (chainIdIn) params.set("chainIdIn", chainIdIn.toString());
        if (currencyOut) params.set("currencyOut", currencyOut);
        if (chainIdOut) params.set("chainIdOut", chainIdOut.toString());

        if (customTokens.length > 0) {
            const tokenData = customTokens.map((token) => ({
                address: token.address,
                chainId: token.chainId,
                symbol: token.symbol,
                name: token.name,
                decimals: token.decimals,
                logoURI: token.logoURI ?? undefined,
            }));
            params.set("customTokens", JSON.stringify(tokenData));
        }

        const baseUrl = `${window.location.origin}/embed`;
        const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
        setEmbedUrl(url);

        if (iframeLoaded && iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.history.replaceState(null, "", url);
        }
    }, [hexTheme, mode, currencyIn, chainIdIn, currencyOut, chainIdOut, customTokens, iframeLoaded]);

    useEffect(() => {
        function handleMessage(event: MessageEvent) {
            if (event.data?.type === "tokenChange") {
                if (event.data.selectingTokenIn) {
                    setCurrencyIn(event.data.symbol);
                    setChainIdIn(event.data.chainId);
                } else {
                    setCurrencyOut(event.data.symbol);
                    setChainIdOut(event.data.chainId);
                }
            }
        }
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    const handleHexChange = (key: string, hexValue: string) => {
        setHexTheme((prev) => ({
            ...prev,
            [key]: hexValue,
        }));
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(embedUrl);
            toast({
                title: "URL copied!",
                description: "The embed URL has been copied to your clipboard.",
            });
        } catch (err) {
            toast({
                title: "Failed to copy",
                description: "Please copy the URL manually.",
                variant: "destructive",
            });
        }
    };

    const openEmbedUrl = () => {
        window.open(embedUrl, "_blank");
    };

    const resetTheme = () => {
        setHexTheme({});
        setCurrencyIn(undefined);
        setChainIdIn(undefined);
        setCurrencyOut(undefined);
        setChainIdOut(undefined);
        setCustomTokens([]);
        if (iframeRef.current) {
            iframeRef.current.src = `${window.location.origin}/embed`;
        }
    };

    const copyHtmlCode = async () => {
        const htmlCode = `<iframe\n  src="${embedUrl}"\n  width="450"\n  height="450"\n  title="Veraswap Widget"\n/>`;
        try {
            await navigator.clipboard.writeText(htmlCode);
            toast({
                title: "HTML code copied!",
                description: "The iframe code has been copied to your clipboard.",
            });
        } catch (err) {
            toast({
                title: "Failed to copy",
                description: "Please copy the code manually.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Embed iFrame Theme Customizer</h1>
                    <p className="text-muted-foreground mt-2">
                        Customize your widget's theme with hex colors and see it live in the iframe
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-full md:max-w-[500px] space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between w-full">
                                    <CardTitle>Live Preview (Iframe)</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Sun className={`h-4 w-4 ${mode === "light" ? "opacity-100" : "opacity-40"}`} />
                                        <Switch
                                            checked={mode === "dark"}
                                            onCheckedChange={(checked) => setMode(checked ? "dark" : "light")}
                                            aria-label="Toggle dark/light mode"
                                        />
                                        <Moon className={`h-4 w-4 ${mode === "dark" ? "opacity-100" : "opacity-40"}`} />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="border rounded-lg overflow-hidden relative">
                                    {!iframeLoaded && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                                            <Loader2 className="h-8 w-8 animate-spin" />
                                        </div>
                                    )}
                                    <iframe
                                        ref={iframeRef}
                                        src={`${window.location.origin}/embed`}
                                        width="450"
                                        height="625"
                                        title="Veraswap Widget"
                                        style={{ background: "transparent" }}
                                        className="w-full"
                                        onLoad={() => setIframeLoaded(true)}
                                    />
                                </div>
                                <Button onClick={resetTheme} variant="outline" className="w-full mt-4">
                                    Reset to Default Theme
                                </Button>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Generated Embed URL</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Input value={embedUrl} readOnly className="font-mono text-sm flex-1" />
                                    <Button onClick={copyToClipboard} size="icon">
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button onClick={openEmbedUrl} variant="outline" size="icon">
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                        <CustomTokenManager tokens={customTokens} onTokensChange={setCustomTokens} />
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>HTML Code</CardTitle>
                                    <Button onClick={copyHtmlCode} size="icon">
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
                                    {`<iframe\n  src="${embedUrl}"\n  width="450"\n  height="625"\n  title="Veraswap Widget"\n/>`}
                                </pre>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="w-full">
                        <Card>
                            <CardHeader>
                                <CardTitle>Theme Customization</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-8">
                                    {THEME_GROUPS.map((group) => (
                                        <div key={group.title}>
                                            <h3 className="text-base font-semibold text-foreground mb-4 border-b pb-1 pl-1 opacity-80">
                                                {group.title}
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                {group.fields.map((key) => {
                                                    const config = THEME_CONFIG.find((c) => c.key === key);
                                                    if (!config) return null;
                                                    return (
                                                        <div key={key} className="flex flex-col items-center">
                                                            <span className="text-base font-medium text-foreground mb-2 text-center">
                                                                {config.label}
                                                            </span>
                                                            <div className="flex items-center gap-3">
                                                                <input
                                                                    type="color"
                                                                    value={hexTheme[key] || "#ffffff"}
                                                                    onChange={(e) =>
                                                                        handleHexChange(key, e.target.value)
                                                                    }
                                                                    className="w-10 h-10 border border-border shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-primary rounded-md bg-transparent"
                                                                    style={{ appearance: "none", padding: 0 }}
                                                                />
                                                                <Input
                                                                    id={key}
                                                                    value={hexTheme[key] || ""}
                                                                    onChange={(e) =>
                                                                        handleHexChange(key, e.target.value)
                                                                    }
                                                                    placeholder="#hex"
                                                                    className="font-mono text-xs w-24 px-2 py-1 text-center"
                                                                />
                                                            </div>
                                                            <span className="text-sm text-muted-foreground text-center mt-2">
                                                                {config.description}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
