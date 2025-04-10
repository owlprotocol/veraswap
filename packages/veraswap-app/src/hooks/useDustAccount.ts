import { useEffect } from "react";
import { Address } from "viem";

export function useDustAccount(walletAddress?: Address, chainId?: number) {
    useEffect(() => {
        if (!walletAddress || !chainId) return;

        const baseUrl =
            import.meta.env.MODE === "development"
                ? "http://localhost:3000"
                : "https://veraswap-test-duster.vercel.app";

        const url = `${baseUrl}/api/${chainId}/${walletAddress}`;

        fetch(url, { method: "POST" })
            .then((res) => {
                if (!res.ok) throw new Error("Dusting failed");
                return res.text();
            })
            .then((text) => {
                console.log("Dusting successful:", text);
            })
            .catch((err) => {
                console.error("Dusting error:", err);
            });
    }, [walletAddress, chainId]);
}
