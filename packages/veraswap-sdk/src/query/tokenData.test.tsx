import { test, expect, describe } from "vitest";
import { renderHook } from "@testing-library/react-hooks";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { http, createConfig } from "wagmi";
import { localhost } from "wagmi/chains";
import { ReactNode } from "react";
import { tokenDataQueryOptions } from "./tokenData.js";
import { TOKEN_LIST } from "../constants.js";

describe("tokenData.test.tsx", () => {
    // Wagmi Config
    const chain = localhost;
    const chainId = chain.id;
    const config = createConfig({
        chains: [chain],
        transports: {
            [chain.id]: http(),
        },
    });

    test("fetchCurrencyQueryOptions - success", async () => {
        const queryClient = new QueryClient();

        const wrapper = ({ children }: { children: ReactNode }) => (
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            </WagmiProvider>
        );

        const { result, waitForNextUpdate } = renderHook(
            () =>
                useQuery(
                    tokenDataQueryOptions(config, {
                        chainId: chainId,
                        address: TOKEN_LIST["TokenA_1337"].address,
                    }),
                ),
            { wrapper },
        );

        expect(result.current.isLoading).toBe(true);
        await waitForNextUpdate();

        expect(result.current.data?.name).toBe("MockA");
        expect(result.current.data?.symbol).toBe("A");
        expect(result.current.data?.decimals).toBe(18);
        expect(result.current.data?.nameError).toBeUndefined();
        expect(result.current.data?.symbolError).toBeUndefined();
        expect(result.current.data?.decimalsError).toBeUndefined();
        expect(result.current.data?.registryError).toBeDefined();
    });

    test("fetchCurrencyQueryOptions - error", async () => {
        const queryClient = new QueryClient();

        const wrapper = ({ children }: { children: ReactNode }) => (
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            </WagmiProvider>
        );

        const { result, waitForNextUpdate } = renderHook(
            () =>
                useQuery(
                    tokenDataQueryOptions(config, {
                        chainId: chainId,
                        address: "0x0000000000000000000000000000000000000001",
                    }),
                ),
            { wrapper },
        );

        expect(result.current.isLoading).toBe(true);
        await waitForNextUpdate();

        expect(result.current.data?.name).toBeUndefined();
        expect(result.current.data?.symbol).toBeUndefined();
        expect(result.current.data?.decimals).toBeUndefined();
        expect(result.current.data?.nameError).toBeDefined();
        expect(result.current.data?.symbolError).toBeDefined();
        expect(result.current.data?.decimalsError).toBeDefined();
        expect(result.current.data?.registryError).toBeDefined();
    });
});
