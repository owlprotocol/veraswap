import { QueryClient } from "@tanstack/react-query";
import { getAnvilAccount } from "@veraswap/anvil-account";
import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";
import { encodeDeployData, http, parseEther, zeroAddress, zeroHash } from "viem";
import { describe, expect, test } from "vitest";
import { createConfig } from "wagmi";

import { BasketFixedUnits } from "../artifacts/BasketFixedUnits.js";
import { opChainL1 } from "../chains/supersim.js";
import { LOCAL_CURRENCIES } from "../constants/tokens.js";
import { LOCAL_UNISWAP_CONTRACTS } from "../constants/uniswap.js";
import { getUniswapV4Address } from "../currency/currency.js";

import { getBasketBurnQuote } from "./getBasketBurnQuote.js";
import { getBasketMintQuote } from "./getBasketMintQuote.js";

describe("basket/getBasketMintQuote.test.ts", function () {
    const config = createConfig({
        chains: [opChainL1],
        transports: {
            [opChainL1.id]: http(),
        },
    });
    const queryClient = new QueryClient();

    const anvilAccount = getAnvilAccount();

    const tokenA = LOCAL_CURRENCIES[0];
    const tokenAAddress = getUniswapV4Address(tokenA);
    const tokenB = LOCAL_CURRENCIES[3];
    const tokenBAddress = getUniswapV4Address(tokenB);

    const basketToken0 = tokenAAddress < tokenBAddress ? tokenAAddress : tokenBAddress;
    const basketToken1 = tokenAAddress < tokenBAddress ? tokenBAddress : tokenAAddress;
    const basketTokens = [
        {
            addr: basketToken0,
            units: parseEther("1"),
        },
        {
            addr: basketToken1,
            units: parseEther("1"),
        },
    ];
    const basket0 = getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            abi: BasketFixedUnits.abi,
            bytecode: BasketFixedUnits.bytecode,
            args: ["Index AB50", "AB50.NF", zeroAddress, 0n, basketTokens],
        }),
        salt: zeroHash,
    });

    test("getBasketMintQuote 0.01 share", async () => {
        const mintAmount = parseEther("0.01");
        const receiver = anvilAccount.address;
        const basketMintParams = {
            chainId: opChainL1.id,
            basket: basket0,
            mintAmount,
            receiver,
            currencyIn: zeroAddress,
            currencyHops: [],
            contracts: {
                v4MetaQuoter: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
            },
        };
        const basketMintQuote = await getBasketMintQuote(queryClient, config, basketMintParams);
        expect(basketMintQuote).toBeDefined();
    });

    test("getBasketBurnQuote 0.01 share", async () => {
        const amount = parseEther("0.01");
        const basketBurnParams = {
            chainId: opChainL1.id,
            basket: basket0,
            amount,
            currencyOut: zeroAddress,
            currencyHops: [],
            contracts: {
                v4MetaQuoter: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
            },
        };
        const basketBurnQuote = await getBasketBurnQuote(queryClient, config, basketBurnParams);
        expect(basketBurnQuote).toBeDefined();
    });
});
