import { getAnvilAccount } from "@veraswap/anvil-account";
import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";
import { createWalletClient, encodeDeployData, http, parseEther, zeroHash } from "viem";
import { describe, expect, test } from "vitest";

import { BasketFixedUnits } from "../artifacts/BasketFixedUnits.js";
import { opChainL1Client } from "../chains/supersim.js";
import { LOCAL_CURRENCIES } from "../constants/tokens.js";
import { getUniswapV4Address } from "../currency/currency.js";

describe("basket/BasketFixedUnits.test.ts", function () {
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
    const basket = getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            abi: BasketFixedUnits.abi,
            bytecode: BasketFixedUnits.bytecode,
            args: [basketTokens, "Index AB50", "AB50"],
        }),
        salt: zeroHash,
    });

    test("mint/burn", async () => {
        const mintHash = await anvilClientL1.writeContract({
            address: basket,
            abi: BasketFixedUnits.abi,
            functionName: "mint",
            args: [parseEther("1")],
        });

        const mintReceipt = await opChainL1Client.waitForTransactionReceipt({ hash: mintHash });
        expect(mintReceipt).toBeDefined();

        const burnHash = await anvilClientL1.writeContract({
            address: basket,
            abi: BasketFixedUnits.abi,
            functionName: "burn",
            args: [parseEther("1")],
        });
        const burnReceipt = await opChainL1Client.waitForTransactionReceipt({ hash: burnHash });
        expect(burnReceipt).toBeDefined();
    });
});
