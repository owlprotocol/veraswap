import { renderHook } from "@testing-library/react-hooks";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { WagmiProvider, http, createConfig } from "wagmi";
import { localhost } from "wagmi/chains";
import { createPublicClient } from "viem";
import { CurrencyAmount, Token } from "@uniswap/sdk-core";
import { beforeEach, describe, expect, test } from "vitest";
import { quoteQueryOptions } from "./quote.js";
import {
    quoteExactInputSingle as quoteExactInputSingleAbi,
    quoteExactOutputSingle as quoteExactOutputSingleAbi,
} from "../artifacts/IV4Quoter.js";
import { MOCK_POOLS, TOKEN_LIST, UNISWAP_CONTRACTS } from "../constants.js";
import { port } from "../test/constants.js";

describe("quote.test.tsx", () => {
    const chain = localhost;
    const chainId = chain.id;
    const transport = http(`http://127.0.0.1:${port}`);
    const publicClient = createPublicClient({
        chain,
        transport,
    });
    const config = createConfig({
        chains: [chain],
        transports: {
            [chain.id]: transport,
        },
    });

    const currencyA = new Token(chain.id, TOKEN_LIST[chainId].TokenA.address, 18, "A");
    const currencyB = new Token(chain.id, TOKEN_LIST[chainId].TokenB.address, 18, "B");

    const currency0 = currencyA.address < currencyB.address ? currencyA : currencyB;
    const currency1 = currencyA.address < currencyB.address ? currencyB : currencyA;

    const poolKey = MOCK_POOLS[chainId];

    const currency0Amount = CurrencyAmount.fromFractionalAmount(currency0, 1, 1);
    const currency1Amount = CurrencyAmount.fromFractionalAmount(currency1, 1, 1);

    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient();
    });

    test("wagmi - quoteExactInputSingle", async () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            </WagmiProvider>
        );

        const { result, waitForNextUpdate } = renderHook(
            () =>
                useQuery(
                    quoteQueryOptions(config, {
                        chainId,
                        poolKey,
                        exactCurrencyAmount: currency0Amount,
                        quoteType: "quoteExactInputSingle",
                        quoterAddress: UNISWAP_CONTRACTS[chainId].QUOTER,
                    }),
                ),
            { wrapper },
        );
        expect(result.current.isLoading).toBe(true);
        await waitForNextUpdate({ timeout: 5000 });

        const quoteExactInputSingleParams = {
            poolKey,
            zeroForOne: true,
            exactAmount: BigInt(currency0Amount.decimalScale.toString()),
            hookData: "0x",
        };
        const [amountOutQuoted, gasEstimateQuoted] = (await publicClient.readContract({
            abi: [quoteExactInputSingleAbi],
            address: UNISWAP_CONTRACTS[chainId].QUOTER,
            functionName: "quoteExactInputSingle",
            args: [quoteExactInputSingleParams],
        })) as [bigint, bigint];

        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(result.current.data![0]).toBe(amountOutQuoted);
        expect(result.current.data![1]).toBe(gasEstimateQuoted);
    });

    test("wagmi - quoteExactOutputSingle", async () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            </WagmiProvider>
        );

        const { result, waitForNextUpdate } = renderHook(
            () =>
                useQuery(
                    quoteQueryOptions(config, {
                        chainId,
                        poolKey,
                        exactCurrencyAmount: currency1Amount,
                        quoteType: "quoteExactOutputSingle",
                        quoterAddress: UNISWAP_CONTRACTS[chainId].QUOTER,
                    }),
                ),
            { wrapper },
        );
        expect(result.current.isLoading).toBe(true);
        await waitForNextUpdate({ timeout: 5000 });

        const quoteExactOutputSingleParams = {
            poolKey,
            zeroForOne: true,
            exactAmount: BigInt(currency1Amount.decimalScale.toString()),
            hookData: "0x",
        };
        const [amountInQuoted, gasEstimatedQuoted] = (await publicClient.readContract({
            abi: [quoteExactOutputSingleAbi],
            address: UNISWAP_CONTRACTS[chainId].QUOTER,
            functionName: "quoteExactOutputSingle",
            args: [quoteExactOutputSingleParams],
        })) as [bigint, bigint];

        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(result.current.data![0]).toBe(amountInQuoted);
        expect(result.current.data![1]).toBe(gasEstimatedQuoted);
    });
});
