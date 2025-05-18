import { BigNumber } from "bignumber.js";
import { Address, hexToBigInt } from "viem";

/***** Pool Pricing *****/
/**
 * Granular pricing calculations require using the bignumber.js library
 * To avoid having the rest of the library juggle `bigint/BigNumber`
 * we provide simple utility functions for common operations
 */

/**
 * Convert `sqrtPrice` (returned by pool state) to an instant price for base/quote
 * Internally we check the invariant `token0 (base) < token1 (quote)`
 * - if base < quote: simply convert (this is the main price)
 * - else: return 1 / price (since trading the reverse)
 * Useful for off-chain financial modelling (eg. portfolio rebalancing) but **NOT** for trade execution
 *
 * @warning **NOT** reliable for trade execution as multiple factors such as liquidity, fees, on-chain activity can
 * vary **actual** execution price. Use `quoter` functions for accurate trade quoting.
 * @see https://docs.algebra.finance/algebra-integral-documentation/algebra-integral-technical-reference/integration-process/interaction-with-pools/getting-data-from-pools#how-to-get-current-price-in-pool
 * @param sqrtPrice
 * @returns base/quote price
 */
export function sqrtPriceToInstantPrice({
    base,
    quote,
    sqrtPrice,
}: {
    base: Address;
    quote: Address;
    sqrtPrice: bigint;
}): BigNumber {
    const price = BigNumber(sqrtPrice as unknown as number)
        .div(BigNumber(2).pow(96))
        .pow(2);

    if (hexToBigInt(base) < hexToBigInt(quote)) {
        return price;
    }

    return BigNumber(1).div(price);
}

/**
 * Simple wrapper to multiply amount*price to get quote amount
 * @param param amount, price
 * @returns amount * price
 */
export function quoteWithPrice({ amount, price }: { amount: bigint; price: BigNumber }): bigint {
    return BigInt(
        BigNumber(amount as unknown as number)
            .times(price)
            .integerValue()
            .toString(),
    );
}
