import { QueryClient } from "@tanstack/react-query";
import { getAnvilAccount } from "@veraswap/anvil-account";
import { createConfig, getBalance, http } from "@wagmi/core";
import { getBalanceQueryOptions } from "@wagmi/core/query";
import { describe, expect, test } from "vitest";

import { opChainL1, opChainL1Client } from "../chains/supersim.js";

/**
 * Simple example showcasing how to use cached calls using QueryClient and wagmi/core
 */
describe("calls/getBalance.test.ts", function () {
    const anvilAccount = getAnvilAccount();
    const config = createConfig({
        chains: [opChainL1],
        transports: {
            [opChainL1.id]: http(),
        },
    });
    const queryClient = new QueryClient();

    test("getBalance", async () => {
        // Example test fetching balance in 3 ways
        // viem
        const viemResult = await opChainL1Client.getBalance({
            address: anvilAccount.address,
        });
        // wagmi/core: calls viem via global config, accepts chainId as parameter
        const wagmiResult = await getBalance(config, { chainId: opChainL1.id, address: anvilAccount.address });
        expect(wagmiResult.value).toBe(viemResult);
        // tanstack/query: call wagmi/core logic via queryOptions supporting custom caching logic
        const queryResult = await queryClient.fetchQuery(
            getBalanceQueryOptions(config, { chainId: opChainL1.id, address: anvilAccount.address }),
        );
        expect(queryResult.value).toBe(viemResult);
    });
});
