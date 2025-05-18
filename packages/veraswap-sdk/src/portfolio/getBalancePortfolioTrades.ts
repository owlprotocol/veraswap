// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { BigNumber } from "bignumber.js";
import { cloneDeep, filter } from "lodash-es";
import { Address, PublicClient } from "viem";

import { getOptimalTradeExactInput, Trade } from "../quoter/getOptimalTrade.js";

import { bigIntFillBucket } from "./bigint-utils/bigIntFillBucket.js";
import { bigIntPredicate } from "./bigint-utils/bigIntPredicate.js";

export interface GetBalancePortfolioTradesParams {
    /** Network public client */
    publicClient: PublicClient;
    /** Algebra Integral quoter address */
    quoterV2: Address;
    /** Liquidity trading assets */
    liquidityTokens?: Address[];
    /** Assets **/
    assets: {
        /** Address */
        address: Address;
        /** Price denominated in `quoteToken` */
        price: BigNumber;
        /** Change in value for trade */
        valueDelta: bigint;
    }[];
}

/**
 * Get optimal trades to rebalance portfolio
 * @param params
 */
export async function getBalancePortfolioTrades(params: GetBalancePortfolioTradesParams): Promise<Trade[]> {
    const { publicClient, quoterV2, liquidityTokens } = params;

    const portfolio = cloneDeep(params.assets);
    // inputs, balance will decrease (valueDelta < 0)
    // sort descending (ascending absolute value)
    const inputs = filter(portfolio, (e) => e.valueDelta < 0n).sort((a, b) =>
        bigIntPredicate(b.valueDelta, a.valueDelta),
    );
    // outputs, balance will increase (valueDelta > 0)
    // sort ascending
    const outputs = filter(portfolio, (e) => e.valueDelta > 0n).sort((a, b) =>
        bigIntPredicate(a.valueDelta, b.valueDelta),
    );

    // prepare for trade matching algo
    const inputValues = inputs.map((e) => -1n * e.valueDelta);
    const outputValues = outputs.map((e) => e.valueDelta);
    const tradeIndices = bigIntFillBucket(inputValues, outputValues);

    return Promise.all(
        tradeIndices.map(async ([inputIdx, outputIdx, value]) => {
            const input = inputs[inputIdx];
            const output = outputs[outputIdx];
            const amountIn = BigInt(BigNumber(value).div(input.price).integerValue().toString());

            const estimate = await getOptimalTradeExactInput({
                publicClient,
                quoterV2,
                amountIn,
                inputAddress: input.address,
                outputAddress: output.address,
                liquidityTokens,
            });
            return estimate.optimalTrade;
        }),
    );
}
