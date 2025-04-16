export const useDomainType = (): "mainnet" | "testnet" | null => {
    const hostname = window.location.hostname;
    if (hostname === "veraswap.io" || hostname === "app.veraswap.io") return "mainnet";
    if (hostname === "testnet.veraswap.io") return "testnet";
    return null;
};
