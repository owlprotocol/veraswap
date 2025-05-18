import { BigNumber } from "bignumber.js";
import { map } from "lodash-es";

export interface GetBalancePortfolioAmountsParams {
    /** Total value of portfolio */
    totalValue: bigint;
    /** Assets **/
    assets: {
        /** Price denominated in `quoteToken` */
        price: BigNumber;
        /** Target portfolio weight */
        weight: number;
    }[];
}

/**
 * Compute target balances
 * @param assets
 */
export function getBalancePortfolioAmounts({
    totalValue,
    assets,
}: GetBalancePortfolioAmountsParams): { targetBalance: bigint; targetValue: bigint }[] {
    const totalWeights = assets.reduce((acc, curr) => acc + curr.weight, 0);
    if (totalWeights === 0) {
        return assets.map(() => {
            return { targetBalance: 0n, targetValue: 0n };
        });
    }

    return map(assets, (asset) => {
        const { price, weight } = asset;

        // targetValue = totalValue * (weight / totalWeights)
        const targetValueBigNumber = BigNumber(totalValue as unknown as number)
            .times(weight)
            .div(totalWeights);
        const targetValue = BigInt(targetValueBigNumber.integerValue().toString());

        // targetBalance = targetValue * (1/price)
        const targetBalance = BigInt(targetValueBigNumber.div(price).integerValue().toString());

        return { targetValue, targetBalance };
    });
}

/** Compute balance deltas */

/*
export interface GetBalancePortfolioAmountsAssetReturnType {
    balanceTarget: bigint;
    balanceDelta: bigint;
    valueTarget: bigint;
    valueDelta: bigint;
}


export function getBalancePortfolioAmounts({ assets }: { assets: GetBalancePortfolioAmountsParams[] }): {
    totalValue: bigint;
    totalRatios: number;
    targetBalances: Prettify<GetBalancePortfolioAmountsAssetReturnType>[];
} {
    const totalValue = assets.reduce((acc, curr) => acc + curr.value, 0n);
    const totalRatios = assets.reduce((acc, curr) => acc + curr.ratio, 0);
    if (totalRatios === 0) throw new Error("getBalancePortfolioAmounts: sum of ratios MUST be > 0");

    const targetBalances = map(assets, (asset) => {
        const { balance, value, ratio } = asset;
        const valueTarget = (totalValue * BigInt(ratio * 10_000)) / BigInt(totalRatios * 10_000);
        const valueDelta = valueTarget - value;
        // Scale balance
        //TODO: Fix division by zero
        const balanceTarget = (balance * valueTarget) / value;
        const balanceDelta = balanceTarget - balance;

        return { balanceTarget, balanceDelta, valueTarget, valueDelta };
    });

    return {
        totalValue,
        totalRatios,
        targetBalances,
    };
}

*/
