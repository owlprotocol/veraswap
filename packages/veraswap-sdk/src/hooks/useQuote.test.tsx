import { renderHook } from "@testing-library/react-hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http, createConfig } from "wagmi";
import { mainnet } from "wagmi/chains";
import { Address, createPublicClient, encodeAbiParameters, keccak256, zeroAddress } from "viem";
import { CurrencyAmount, Token } from "@uniswap/sdk-core";
import { beforeEach, describe, expect, test } from "vitest";

import dotenv from "dotenv";

import { useQuote } from "./useQuote.js";
import { IStateView } from "../artifacts/IStateView.js";
import { quoteExactInputSingle as quoteExactInputSingleAbi } from "../artifacts/IV4Quoter.js";

dotenv.config();

export type PoolKey = {
    currency0: Address;
    currency1: Address;
    fee: number;
    tickSpacing: number;
    hooks: Address;
};

const PoolKeyAbi = {
    components: [
        { internalType: "address", name: "currency0", type: "address" },
        { internalType: "address", name: "currency1", type: "address" },
        { internalType: "uint24", name: "fee", type: "uint24" },
        { internalType: "int24", name: "tickSpacing", type: "int24" },
        { internalType: "address", name: "hooks", type: "address" },
    ],
    internalType: "struct PoolKey",
    type: "tuple",
} as const;

// https://docs.uniswap.org/contracts/v4/deployments
const QUOTER = "0x52f0e24d1c21c8a0cb1e5a5dd6198556bd9e1203";
const STATE_VIEW = "0x7ffe42c4a5deea5b0fec41c94c136cf115597227";

const chain = mainnet;
const rpc = process.env.MAINNET_RPC_URL as string;
if (!rpc) throw new Error("Update .env file");

const transport = http(rpc);
const config = createConfig({
    chains: [chain],
    transports: {
        [chain.id]: transport,
    },
});

const publicClient = createPublicClient({ chain, transport });
const currencyA = new Token(chain.id, "0x111111111117dC0aa78b770fA6A738034120C302" as Address, 18, "1INCH");
const currencyB = new Token(chain.id, "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" as Address, 6, "USDC");

const currency0 = currencyA.address < currencyB.address ? currencyA : currencyB;
const currency1 = currencyA.address < currencyB.address ? currencyB : currencyA;

const poolKey = {
    currency0: currency0.address as Address,
    currency1: currency1.address as Address,
    fee: 10_000,
    tickSpacing: 200,
    hooks: zeroAddress,
} as PoolKey;

const currency0Amount = CurrencyAmount.fromFractionalAmount(currency0, 1, 1);

const currency1Amount = CurrencyAmount.fromFractionalAmount(currency1, 1, 1);

describe("useQuote", () => {
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
                    quoterAddress: QUOTER,
                }),
            { wrapper },
        );
        expect(result.current.isLoading).toBe(true);

        await waitForNextUpdate({ timeout: 5000 });
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(result.current.quote).toBeGreaterThan(0n);
        expect(result.current.gasEstimate).toBeGreaterThan(0n);
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
                    quoterAddress: QUOTER,
                }),
            { wrapper },
        );
        expect(result.current.isLoading).toBe(true);

        await waitForNextUpdate({ timeout: 5000 });
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(result.current.quote).toBeGreaterThan(0n);
        expect(result.current.gasEstimate).toBeGreaterThan(0n);
    });

    test("viem - quoteExactInputSingle", async () => {
        // Get current liquidity
        const poolId = keccak256(encodeAbiParameters([PoolKeyAbi], [poolKey]));
        const currentLiquidity = await publicClient.readContract({
            address: STATE_VIEW,
            abi: IStateView.abi,
            functionName: "getLiquidity",
            args: [poolId],
        });
        expect(currentLiquidity).toBeGreaterThan(0n); // pool exists

        const amountIn = BigInt(currency0Amount.decimalScale.toString());
        const quoteExactInputSingleParams = { poolKey, zeroForOne: true, exactAmount: amountIn, hookData: "0x" };

        const [amountOutQuoted, gasEstimate] = (await publicClient.readContract({
            abi: [quoteExactInputSingleAbi],
            address: QUOTER,
            functionName: "quoteExactInputSingle",
            args: [quoteExactInputSingleParams],
        })) as [bigint, bigint];
        expect(amountOutQuoted).toBeGreaterThan(0n);
        expect(gasEstimate).toBeGreaterThan(0n);
    });
});
