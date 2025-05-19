import { getAnvilAccount } from "@veraswap/anvil-account";
import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";
import { createWalletClient, encodeDeployData, http, padHex, parseEther, zeroAddress, zeroHash } from "viem";
import { describe, expect, test } from "vitest";

import { BasketFixedUnits } from "../artifacts/BasketFixedUnits.js";
import { IERC20 } from "../artifacts/IERC20.js";
import { opChainL1Client } from "../chains/supersim.js";
import { LOCAL_CURRENCIES } from "../constants/tokens.js";
import { getUniswapV4Address } from "../currency/currency.js";

describe("basket/BasketFixedUnits.test.ts", function () {
    const address1 = padHex("0x1", { size: 20 });
    const address2 = padHex("0x2", { size: 20 });

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
    const basket1 = getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            abi: BasketFixedUnits.abi,
            bytecode: BasketFixedUnits.bytecode,
            args: ["Index AB50", "AB50", address1, 10_000n, basketTokens],
        }),
        salt: zeroHash,
    });

    test("mint/burn - no fee", async () => {
        const mintHash = await anvilClientL1.writeContract({
            address: basket0,
            abi: BasketFixedUnits.abi,
            functionName: "mint",
            args: [parseEther("1"), anvilAccount.address, zeroAddress],
        });

        const mintReceipt = await opChainL1Client.waitForTransactionReceipt({ hash: mintHash });
        expect(mintReceipt).toBeDefined();

        const balancePostMint = await opChainL1Client.readContract({
            address: basket0,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [anvilAccount.address],
        });
        expect(balancePostMint).toEqual(parseEther("1"));

        const burnHash = await anvilClientL1.writeContract({
            address: basket0,
            abi: BasketFixedUnits.abi,
            functionName: "burn",
            args: [parseEther("1")],
        });
        const burnReceipt = await opChainL1Client.waitForTransactionReceipt({ hash: burnHash });
        expect(burnReceipt).toBeDefined();

        const balancePostBurn = await opChainL1Client.readContract({
            address: basket0,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [anvilAccount.address],
        });
        expect(balancePostBurn).toEqual(0n);
    });

    test("mint/burn - with owner fee", async () => {
        const mintHash = await anvilClientL1.writeContract({
            address: basket1,
            abi: BasketFixedUnits.abi,
            functionName: "mint",
            args: [parseEther("1"), anvilAccount.address, zeroAddress],
        });

        const mintReceipt = await opChainL1Client.waitForTransactionReceipt({ hash: mintHash });
        expect(mintReceipt).toBeDefined();

        const balancePostMint = await opChainL1Client.readContract({
            address: basket1,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [anvilAccount.address],
        });
        expect(balancePostMint).toEqual(parseEther("0.99"));

        const burnHash = await anvilClientL1.writeContract({
            address: basket1,
            abi: BasketFixedUnits.abi,
            functionName: "burn",
            args: [parseEther("0.99")],
        });
        const burnReceipt = await opChainL1Client.waitForTransactionReceipt({ hash: burnHash });
        expect(burnReceipt).toBeDefined();

        const balancePostBurn = await opChainL1Client.readContract({
            address: basket1,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [anvilAccount.address],
        });
        expect(balancePostBurn).toEqual(0n);
    });

    test("mint/burn - with referrer fee", async () => {
        const mintHash = await anvilClientL1.writeContract({
            address: basket1,
            abi: BasketFixedUnits.abi,
            functionName: "mint",
            args: [parseEther("1"), anvilAccount.address, address2],
        });

        const mintReceipt = await opChainL1Client.waitForTransactionReceipt({ hash: mintHash });
        expect(mintReceipt).toBeDefined();

        const balancePostMint = await opChainL1Client.readContract({
            address: basket1,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [anvilAccount.address],
        });
        expect(balancePostMint).toEqual(parseEther("0.99"));

        const burnHash = await anvilClientL1.writeContract({
            address: basket1,
            abi: BasketFixedUnits.abi,
            functionName: "burn",
            args: [parseEther("0.99")],
        });
        const burnReceipt = await opChainL1Client.waitForTransactionReceipt({ hash: burnHash });
        expect(burnReceipt).toBeDefined();

        const balancePostBurn = await opChainL1Client.readContract({
            address: basket1,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [anvilAccount.address],
        });
        expect(balancePostBurn).toEqual(0n);

        const balanceReferrer = await opChainL1Client.readContract({
            address: basket1,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [address2],
        });
        expect(balanceReferrer).toEqual(parseEther("0.005"));
    });
});
