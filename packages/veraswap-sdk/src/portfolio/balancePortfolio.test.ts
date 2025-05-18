import { createPublicClient, http } from "viem";
import { describe, expect, test } from "vitest";

import { balancePortfolio } from "./balancePortfolio.js";

describe("balancePortfolio.test.ts", function () {
    const publicClient = createPublicClient({
        transport: http("https://mode.drpc.org/"),
    });
    const poolInitCodeHash = "0xf96d2474815c32e070cd63233f06af5413efc5dcb430aee4ff18cc29007c562d";
    const poolDeployer = "0x6414A461B19726410E52488d9D5ff33682701635";
    const quoterV2 = "0x7c5aaa464f736740156fd69171505d344855d1e5";
    const swapRouter = "0xAc48FcF1049668B285f3dC72483DF5Ae2162f7e8";

    const USDC = "0xd988097fb8612cc24eeC14542bC03424c656005f";
    const WETH = "0x4200000000000000000000000000000000000006";
    const MODE = "0xDfc7C877a950e49D2610114102175A06C2e3167a";

    test("balancePortfolio", async () => {
        const portfolio = await balancePortfolio({
            publicClient,
            poolInitCodeHash,
            poolDeployer,
            quoterV2,
            swapRouter,
            account: "0xfE732ca712C695Ee14a8A015E65997dD9189C31b",
            assets: [
                { address: USDC, weight: 0 },
                { address: WETH, weight: 1 },
                { address: MODE, weight: 0 },
            ],
        });

        expect(portfolio).toBeDefined();

        // console.debug(portfolio);
        // console.debug(`Total Holding Value $${formatUnits(portfolio.totalValue, 6)}`);
        // console.debug(`Total Trade Value $${formatUnits(portfolio.totalTradeValue, 6)}`);
    });
});
