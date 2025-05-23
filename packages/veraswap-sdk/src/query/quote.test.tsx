import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react-hooks";
import { CurrencyAmount, Token } from "@uniswap/sdk-core";
import { Address, createPublicClient, zeroAddress } from "viem";
import { beforeEach, describe, expect, test } from "vitest";
import { createConfig, http, WagmiProvider } from "wagmi";
import { localhost } from "wagmi/chains";

import {
    quoteExactInputSingle as quoteExactInputSingleAbi,
    quoteExactOutputSingle as quoteExactOutputSingleAbi,
} from "../artifacts/IV4Quoter.js";
import { UNISWAP_CONTRACTS } from "../constants/uniswap.js";

import { quoteQueryOptions } from "./quote.js";

describe("quote.test.tsx", () => {
    const chain = localhost;
    const chainId = chain.id;
    const port = 8545; //TODO: incorrect port
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

    //TODO: Fix test with real deployed addresses
    const currencyA = new Token(chain.id, zeroAddress, 18, "A");
    const currencyB = new Token(chain.id, zeroAddress, 18, "B");

    const currency0 = currencyA.address < currencyB.address ? currencyA : currencyB;
    const currency1 = currencyA.address < currencyB.address ? currencyB : currencyA;

    // const poolKey = MOCK_POOLS?.[chainId];
    const poolKey = {
        currency0: currency0.address as Address,
        currency1: currency1.address as Address,
        fee: 3000,
        tickSpacing: 60,
        hooks: zeroAddress,
    };

    const currency0Amount = CurrencyAmount.fromFractionalAmount(currency0, 1, 1);
    const currency1Amount = CurrencyAmount.fromFractionalAmount(currency1, 1, 1);

    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient();
    });

    test.skip("wagmi - quoteExactInputSingle", async () => {
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
                        quoterAddress: UNISWAP_CONTRACTS[chainId]!.v4Quoter,
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
            address: UNISWAP_CONTRACTS[chainId]!.v4Quoter,
            functionName: "quoteExactInputSingle",
            args: [quoteExactInputSingleParams],
        })) as [bigint, bigint];

        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(result.current.data![0]).toBe(amountOutQuoted);
        expect(result.current.data![1]).toBe(gasEstimateQuoted);
    });

    test.skip("wagmi - quoteExactOutputSingle", async () => {
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
                        quoterAddress: UNISWAP_CONTRACTS[chainId]!.v4Quoter,
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
            address: UNISWAP_CONTRACTS[chainId]!.v4Quoter,
            functionName: "quoteExactOutputSingle",
            args: [quoteExactOutputSingleParams],
        })) as [bigint, bigint];

        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(result.current.data![0]).toBe(amountInQuoted);
        expect(result.current.data![1]).toBe(gasEstimatedQuoted);
    });
});
