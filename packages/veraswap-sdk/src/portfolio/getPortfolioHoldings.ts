// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { BigNumber } from "bignumber.js";
import { map, zip } from "lodash-es";
import { Address, erc20Abi, Hex, PublicClient } from "viem";

import { getPoolAddress, getPoolState } from "../pool/getPool.js";
import { quoteWithPrice, sqrtPriceToInstantPrice } from "../pool/getPoolPrice.js";
import { Prettify } from "../types/Prettify.js";

export interface PortfolioAsset {
    /** Address */
    address: Address;
    /** Balance */
    balance: bigint;
    /** Value denominated in `quoteToken` */
    value: bigint;
    /** Price denominatd in `quoteToken` */
    price: BigNumber;
    /** Basis points of portfolio */
    bips: number;
}
/**
 * Manage a portfolio of assets
 */
export interface PortfolioHoldings {
    /**
     * Unit of account (WETH recommended)
     * NOTE: All assets MUST have a liquidity pool with `quoteToken`
     **/
    quoteToken: Address;
    /** Assets */
    assets: PortfolioAsset[];
    /** Total value of portfolio */
    totalValue: bigint;
}

export interface GetPortfolioParams {
    /** Network public client */
    publicClient: PublicClient;
    /** Algebra Integral pool deployer */
    poolDeployer: Address;
    /** Algebra Integral pool init code hash */
    poolInitCodeHash: Hex;
    /** WETH address for native balance fetching */
    weth: Address;
    /** Account */
    account: Address;
    /** Portfolio tokens */
    tokens: Address[];
    /** Unit of account (eg. WETH, USDC) */
    quoteToken?: Address;
}

/**
 * Get portfolio information for a list of tokens such as balances, valuations, and distribution
 * @warning Valuations use pool prices and do not account for transaction costs (price impact, fees etc...)
 * @warning WETH ERC20 balance is ignored in favor of native balance, WETH balance should be unwrapped manually
 * @param params
 * @returns portfolio data
 */
export async function getPortfolioHoldings(params: GetPortfolioParams): Promise<Prettify<PortfolioHoldings>> {
    const { publicClient, poolDeployer, poolInitCodeHash, account, tokens } = params;
    const weth = params.weth;
    const quoteToken = params.quoteToken ?? weth;

    const balances = await Promise.all(
        tokens.map(async (address) => {
            // Native token
            if (address.toLowerCase() === weth.toLowerCase()) {
                return publicClient.getBalance({ address: account });
            }

            return publicClient.readContract({
                address,
                abi: erc20Abi,
                functionName: "balanceOf",
                args: [account],
            });
        }),
    );

    //TODO: This could be made a generic param for modular pricing strategies (address) => price
    const prices = await Promise.all(
        map(tokens, async (address) => {
            // No need to convert
            if (address.toLowerCase() === quoteToken.toLowerCase()) return BigNumber(1);

            const poolAddress = getPoolAddress({ token0: address, token1: quoteToken, poolDeployer, poolInitCodeHash });
            const pool = await getPoolState({ publicClient, address: poolAddress });
            const price = sqrtPriceToInstantPrice({ sqrtPrice: pool.sqrtPrice, base: address, quote: quoteToken });

            return price;
        }),
    );
    const values = await Promise.all(
        map(zip(prices, balances) as [BigNumber, bigint][], async ([price, balance]) => {
            return quoteWithPrice({ amount: balance, price });
        }),
    );
    const { totalValue, basisPoints } = getPortfolioDistribution(values);

    const assets = map(
        zip(tokens, balances, prices, values, basisPoints) as [Address, bigint, BigNumber, bigint, number][],
        ([address, balance, price, value, bips]) => {
            return {
                address,
                balance,
                price,
                value,
                bips,
            };
        },
    );

    return {
        quoteToken,
        assets,
        totalValue,
    };
}

/**
 * Compute portfolio distribution
 * @param values
 */
export function getPortfolioDistribution(values: bigint[]): {
    totalValue: bigint;
    basisPoints: number[];
} {
    const totalValue = values.reduce((acc, curr) => acc + curr, 0n);
    if (totalValue === 0n) {
        // no value, portfolio empty
        return {
            totalValue,
            basisPoints: map(values, () => 0),
        };
    }

    const basisPoints = map(values, (value) => {
        return Number((value * 10_000n) / totalValue);
    });

    return {
        totalValue,
        basisPoints,
    };
}
