import { Currency } from "@owlprotocol/veraswap-sdk";
import { chains } from "@/config.js";

export const TokenBadge = ({ currency }: { currency: Currency }) => {
    const chain = chains.find((chain) => chain.id === currency.chainId);
    const chainLogo = chain?.custom?.logoURI ?? "https://etherscan.io/images/svg/brands/ethereum-original.svg";

    return (
        <div
            className="relative inline-block h-8 w-8"
            title={`${currency.name ?? currency.symbol ?? "Token"} on ${chain?.name ?? "Unknown Chain"}`}
        >
            <img
                src={currency.logoURI ?? "https://etherscan.io/images/main/empty-token.png"}
                alt={currency.symbol ?? "Token"}
                className="block h-full w-full rounded-full"
                onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
            />
            <img
                src={chainLogo}
                alt={`${chain?.name ?? "Chain"} logo`}
                className="absolute bottom-0 left-[-6px] h-5 w-5 rounded-full bg-background"
                style={{ transform: "translate(-15%, 15%)" }}
                onError={(e) => (e.currentTarget.style.display = "none")}
            />
        </div>
    );
};
