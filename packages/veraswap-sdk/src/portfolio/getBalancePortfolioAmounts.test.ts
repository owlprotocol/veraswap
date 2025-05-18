import { BigNumber } from "bignumber.js";
import { describe, expect, test } from "vitest";

import { getBalancePortfolioAmounts } from "./getBalancePortfolioAmounts.js";

describe("getBalancePortfolioAmounts.test.ts", function () {
    test("getBalancePortfolioAmounts", () => {
        const portfolio = getBalancePortfolioAmounts({
            totalValue: 100n,
            assets: [
                { price: BigNumber(1), weight: 60 },
                { price: BigNumber(2), weight: 30 },
                { price: BigNumber(5), weight: 10 },
            ],
        });
        expect(portfolio).toStrictEqual([
            { targetValue: 60n, targetBalance: 60n },
            { targetValue: 30n, targetBalance: 15n },
            { targetValue: 10n, targetBalance: 2n },
        ]);
    });
});
