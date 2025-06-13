interface VeraSwapIframeProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    showSettings?: boolean;
    currencyIn?: string;
    chainIdIn?: number;
    currencyOut?: string;
    chainIdOut?: number;
    type?: "mainnet" | "testnet" | "local";
}

export const VeraSwapIframe = ({
    className = "",
    width = "100%",
    height = "600px",
    showSettings = true,
    currencyIn,
    chainIdIn,
    currencyOut,
    chainIdOut,
    type = "mainnet",
}: VeraSwapIframeProps) => {
    const buildEmbedUrl = () => {
        const params = new URLSearchParams();

        if (type) params.append("type", type);
        if (currencyIn) params.append("currencyIn", currencyIn);
        if (chainIdIn) params.append("chainIdIn", chainIdIn.toString());
        if (currencyOut) params.append("currencyOut", currencyOut);
        if (chainIdOut) params.append("chainIdOut", chainIdOut.toString());
        if (showSettings !== undefined) params.append("showSettings", showSettings.toString());

        const baseUrl = import.meta.env.VITE_VERASWAP_EMBED_URL || "http://localhost:5173/widget";
        return `${baseUrl}?${params.toString()}`;
    };

    return (
        <iframe
            src={buildEmbedUrl()}
            className={`${className}`}
            width={width}
            height={height}
            allow="camera; microphone; geolocation"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            title="VeraSwap Widget"
        />
    );
};
