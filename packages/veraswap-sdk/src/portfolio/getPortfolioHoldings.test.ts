import { createPublicClient, http } from "viem";
import { describe, expect, test } from "vitest";

import { getPortfolioHoldings } from "./getPortfolioHoldings.js";

describe("getPortfolioHoldings.test.ts", function () {
    const publicClient = createPublicClient({
        transport: http("https://mode.drpc.org/"),
    });
    const poolInitCodeHash = "0xf96d2474815c32e070cd63233f06af5413efc5dcb430aee4ff18cc29007c562d";
    const poolDeployer = "0x6414A461B19726410E52488d9D5ff33682701635";

    const USDC = "0xd988097fb8612cc24eeC14542bC03424c656005f";
    const WETH = "0x4200000000000000000000000000000000000006";
    const MODE = "0xDfc7C877a950e49D2610114102175A06C2e3167a";

    test("getPortfolioHoldings", async () => {
        const portfolio = await getPortfolioHoldings({
            publicClient,
            poolInitCodeHash,
            poolDeployer,
            weth: WETH,
            account: "0xfE732ca712C695Ee14a8A015E65997dD9189C31b",
            tokens: [USDC, WETH, MODE],
        });

        expect(portfolio).toBeDefined();

        /*
        console.debug(
            portfolio.assets.map(({ address, value, price }) => {
                const units = address === USDC ? 6 : 18;
                return `${address} $${formatUnits(value, 6)} at $${formatUnits(
                    quoteWithPrice({
                        amount: parseUnits("1", units),
                        price,
                    }),
                    6,
                )}`;
            }),
        );
        */
        // console.debug(`Total Value $${formatUnits(portfolio.totalValue, 6)}`);
    });
});
