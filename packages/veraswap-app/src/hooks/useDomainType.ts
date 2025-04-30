const mainnetDomains = ["veraswap.io", "app.veraswap.io", "www.veraswap.io"];
const testnetDomains = ["testnet.veraswap.io"];

export const useDomainType = (): "mainnet" | "testnet" | null => {
    const hostname = window.location.hostname;
    if (mainnetDomains.includes(hostname)) return "mainnet";
    if (testnetDomains.includes(hostname)) return "testnet";
    return null;
};
