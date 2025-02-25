import { renderHook } from "@testing-library/react-hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http, createConfig } from "wagmi";
import { localhost } from "wagmi/chains";
import { Address, createPublicClient, zeroAddress } from "viem";
import { CurrencyAmount, Token } from "@uniswap/sdk-core";
import { beforeEach, describe, expect, test } from "vitest";
import { useQuote } from "./useQuote.js";
import { quoteExactInputSingle as quoteExactInputSingleAbi, quoteExactOutputSingle as quoteExactOutputSingleAbi } from "../artifacts/IV4Quoter.js";
import { PoolKey } from "../types/PoolKey.js";
import { MOCK_TOKENS, UNISWAP_CONTRACTS } from "../constants.js";
import { port } from "../test/constants.js";


describe("useQuote.test.tsx", () => {
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

    const currencyA = new Token(chain.id, MOCK_TOKENS[chainId].MOCK_A, 18, "A");
    const currencyB = new Token(chain.id, MOCK_TOKENS[chainId].MOCK_B, 18, "B");

    const currency0 = currencyA.address < currencyB.address ? currencyA : currencyB;
    const currency1 = currencyA.address < currencyB.address ? currencyB : currencyA;

    const poolKey = {
        currency0: currency0.address as Address,
        currency1: currency1.address as Address,
        fee: 3000,
        tickSpacing: 60,
        hooks: zeroAddress,
    } as PoolKey;

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
                useQuote({
                    poolKey,
                    exactCurrencyAmount: currency0Amount,
                    quoteType: "quoteExactInputSingle",
                    quoterAddress: UNISWAP_CONTRACTS[chainId].QUOTER,
                }),
            { wrapper },
        );
        expect(result.current.isLoading).toBe(true);
        await waitForNextUpdate({ timeout: 5000 });

        const quoteExactInputSingleParams = { poolKey, zeroForOne: true, exactAmount: BigInt(currency0Amount.decimalScale.toString()), hookData: "0x" };
        const [amountOutQuoted, gasEstimateQuoted] = (await publicClient.readContract({
            abi: [quoteExactInputSingleAbi],
            address: UNISWAP_CONTRACTS[chainId].QUOTER,
            functionName: "quoteExactInputSingle",
            args: [quoteExactInputSingleParams],
        })) as [bigint, bigint];

        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(result.current.quote).toBe(amountOutQuoted);
        expect(result.current.gasEstimate).toBe(gasEstimateQuoted);
    });

    test("wagmi - quoteExactOutputSingle", async () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            </WagmiProvider>
        );

        const { result, waitForNextUpdate } = renderHook(
            () =>
                useQuote({
                    poolKey,
                    exactCurrencyAmount: currency1Amount,
                    quoteType: "quoteExactOutputSingle",
                    quoterAddress: UNISWAP_CONTRACTS[chainId].QUOTER,
                }),
            { wrapper },
        );
        expect(result.current.isLoading).toBe(true);
        await waitForNextUpdate({ timeout: 5000 });

        const quoteExactOutputSingleParams = { poolKey, zeroForOne: true, exactAmount: BigInt(currency1Amount.decimalScale.toString()), hookData: "0x" };
        const [amountInQuoted, gasEstimatedQuoted] = (await publicClient.readContract({
            abi: [quoteExactOutputSingleAbi],
            address: UNISWAP_CONTRACTS[chainId].QUOTER,
            functionName: "quoteExactOutputSingle",
            args: [quoteExactOutputSingleParams],
        })) as [bigint, bigint];

        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(result.current.quote).toBe(amountInQuoted);
        expect(result.current.gasEstimate).toBe(gasEstimatedQuoted);
    });
});
