const mainnetDomains = ["app.veraswap.io", "www.app.veraswap.io"];
const testnetDomains = ["testnet.veraswap.io", "www.testnet.veraswap.io"];

export const useDomainType = (): "mainnet" | "testnet" | null => {
    const hostname = window.location.hostname;
    if (mainnetDomains.includes(hostname)) return "mainnet";
    if (testnetDomains.includes(hostname)) return "testnet";
    return null;
};
