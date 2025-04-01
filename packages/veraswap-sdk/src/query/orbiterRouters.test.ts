import { describe, expect, test } from "vitest";
import { orbiterRouters } from "./orbiterRouters.js";

describe("orbiterRouters.test.ts", function () {
    test("Get orbiter routers mainnet", async () => {
        const isMainnet = true;
        const orbiterRoutersMainnet = await orbiterRouters(isMainnet);

        expect(orbiterRoutersMainnet.length).toBeGreaterThan(0);
        const polygonMainnetEthRoute = orbiterRoutersMainnet.find((route) => route.line === "137/1-ETH/ETH");
        expect(polygonMainnetEthRoute).toBeDefined();
        expect(Number(polygonMainnetEthRoute!.withholdingFee)).toBeGreaterThan(0);
    });
});
