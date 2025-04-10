import { useEffect } from "react";
import { Address } from "viem";

const DUSTER_BASE_URL =
    import.meta.env.MODE === "development" ? "http://localhost:3000" : "https://veraswap-test-duster.vercel.app";

export function useDustAccount(walletAddress?: Address) {
    useEffect(() => {
        if (!walletAddress) return;

        const url = `${DUSTER_BASE_URL}/api/${walletAddress}`;

        fetch(url, { method: "POST" })
            .then((res) => {
                if (!res.ok) throw new Error("Dusting failed");
                return res.json();
            })
            .then((result) => {
                console.log("Dusting result:", result);
            })
            .catch((err) => {
                console.error("Dusting error:", err);
            });
    }, [walletAddress]);
}
