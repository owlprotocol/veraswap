import { QueryClient } from "@tanstack/react-query";
import { getAnvilAccount } from "@veraswap/anvil-account";
import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";
import { createWalletClient, encodeDeployData, http, parseEther, zeroAddress, zeroHash } from "viem";
import { describe, expect, test } from "vitest";
import { createConfig } from "wagmi";

import { BasketFixedUnits } from "../artifacts/BasketFixedUnits.js";
import { IERC20 } from "../artifacts/IERC20.js";
import { opChainL1, opChainL1Client } from "../chains/supersim.js";
import { LOCAL_CURRENCIES } from "../constants/tokens.js";
import { LOCAL_UNISWAP_CONTRACTS } from "../constants/uniswap.js";
import { getUniswapV4Address } from "../currency/currency.js";

import { getBasketMint } from "./getBasketMint.js";

describe("basket/getBasketMint.test.ts", function () {
    const config = createConfig({
        chains: [opChainL1],
        transports: {
            [opChainL1.id]: http(),
        },
    });
    const queryClient = new QueryClient();

    const anvilAccount = getAnvilAccount();
    const anvilClientL1 = createWalletClient({
        account: anvilAccount,
        chain: opChainL1Client.chain,
        transport: http(),
    });

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
            args: ["Index AB50", "AB50", zeroAddress, 0n, basketTokens],
        }),
        salt: zeroHash,
    });

    test("mint/burn - no fee", async () => {
        const call = await getBasketMint(queryClient, config, {
            chainId: opChainL1.id,
            basket: basket0,
            mintAmount: parseEther("0.01"),
            receiver: anvilAccount.address,
            currencyIn: zeroAddress,
            slippageCentiBps: 0n, //TODO: Ignored for now
            deadline: BigInt(Math.floor(Date.now() / 1000) + 3600),
            currencyHops: [],
            contracts: {
                v4MetaQuoter: LOCAL_UNISWAP_CONTRACTS.v4MetaQuoter,
                universalRouter: LOCAL_UNISWAP_CONTRACTS.universalRouter,
            },
        });
        const hash = await anvilClientL1.writeContract(call);

        const receipt = await opChainL1Client.waitForTransactionReceipt({ hash: hash });
        expect(receipt).toBeDefined();

        const balancePostMint = await opChainL1Client.readContract({
            address: basket0,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [anvilAccount.address],
        });
        expect(balancePostMint).toEqual(parseEther("0.1"));
    });
});
