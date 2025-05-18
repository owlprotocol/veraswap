// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { BigNumber } from "bignumber.js";
import { map, uniqBy, zip } from "lodash-es";
import { Address, Hex, PublicClient } from "viem";

import { getAlgebraWeth } from "../constants.js";
import { getERC20ApprovalTransaction } from "../swaprouter/getERC20ApprovalTransaction.js";
import {
    getMulticallSwapTransaction,
    prepareMulticallSwapExactInput,
} from "../swaprouter/getMulticallSwapTransaction.js";

import { getBalancePortfolioAmounts } from "./getBalancePortfolioAmounts.js";
import { getBalancePortfolioTrades } from "./getBalancePortfolioTrades.js";
import { getPortfolioHoldings, PortfolioAsset } from "./getPortfolioHoldings.js";

export interface BalancePortfolioParams {
    /** Network public client */
    publicClient: PublicClient;
    /** Algebra Integral pool deployer */
    poolDeployer: Address;
    /** Algebra Integral pool init code hash */
    poolInitCodeHash: Hex;
    /** Algebra Integral quoter address */
    quoterV2: Address;
    /** Algebra Integral swap router address */
    swapRouter: Address;
    /** Account */
    account: Address;
    /** Portfolio tokens */
    assets: { address: Address; weight: number }[];
    /** WETH address for native token wrapping/unwrapping */
    weth?: Address;
    /** Unit of account (defaults to `weth`) */
    quoteToken?: Address;
    /** Liquidity trading assets (defaults to `weth`) */
    liquidityTokens?: Address[];
    /** Swap expiry (defaults to 1hr) */
    deadline?: bigint;
    /** Slippage tolerance % (defaults to 0.50) */
    slippagePercent?: number;
}

/**
 * Get necessary trades to balance portfolio to target basis points
 */
export async function balancePortfolio(params: BalancePortfolioParams) {
    const { publicClient, account, poolInitCodeHash, poolDeployer, swapRouter, quoterV2, deadline } = params;
    const weth = params.weth ?? (await getAlgebraWeth({ publicClient, swapRouter }));
    const quoteToken = params.quoteToken ?? weth;
    // use weth as source of potential liquidity
    const liquidityTokens = params.liquidityTokens ?? [weth];
    const slippagePercent = params.slippagePercent ?? 0.5; // 0.50%

    // unique addresses
    // portfolio weights
    const paramsAssetsUniq = uniqBy(params.assets, (a) => a.address);
    const tokens = paramsAssetsUniq.map((a) => a.address);
    const weights = paramsAssetsUniq.map((a) => a.weight);

    // portfolio holdings
    const holdings = await getPortfolioHoldings({
        publicClient,
        poolDeployer,
        poolInitCodeHash,
        weth,
        account,
        quoteToken,
        tokens,
    });
    // portfolio target distribution
    const targets = getBalancePortfolioAmounts({
        totalValue: holdings.totalValue,
        assets: map(zip(holdings.assets, weights) as [PortfolioAsset, number][], ([{ price }, weight]) => {
            return { price, weight };
        }),
    });
    // portfolio change t1 (future) - t0 (current)
    // negative delta: outflow, sell (input)
    // positive delta: inflow, buy (output)
    const deltas = map(
        zip(holdings.assets, targets) as [PortfolioAsset, { targetValue: bigint; targetBalance: bigint }][],
        ([asset, { targetValue, targetBalance }]) => {
            return {
                balanceDelta: targetBalance - asset.balance,
                valueDelta: targetValue - asset.value,
            };
        },
    );

    const totalTradeValue =
        -1n *
        deltas
            // filter outflows
            .filter(({ valueDelta }) => valueDelta < 0)
            .reduce((acc, { valueDelta }) => acc + valueDelta, 0n);

    const trades = await getBalancePortfolioTrades({
        publicClient,
        quoterV2,
        liquidityTokens,
        assets: map(
            zip(holdings.assets, deltas) as [PortfolioAsset, { valueDelta: bigint }][],
            ([{ address, price }, { valueDelta }]) => {
                return { address, price, valueDelta };
            },
        ),
    });

    // Get approvals
    const approvals = await Promise.all(
        (zip(holdings.assets, deltas) as [PortfolioAsset, { balanceDelta: bigint }][])
            // outflows, skip WETH
            .filter(
                ([{ address }, { balanceDelta }]) => balanceDelta < 0 && address.toLowerCase() != weth.toLowerCase(),
            )
            // get approval transaction
            .map(([{ address }, { balanceDelta }]) =>
                getERC20ApprovalTransaction({
                    publicClient,
                    address,
                    owner: account,
                    spender: swapRouter,
                    amount: -1n * balanceDelta,
                }),
            ),
    );
    const approvalTransactions = approvals.filter((e) => e.transaction).map((e) => e.transaction!);

    // Get swap transactions
    const swapTransactions = trades.map((t) => {
        const amountOutMinimumBigNumber = BigNumber(t.quote.amountOut as any)
            .times(BigNumber(100 - slippagePercent))
            .div(BigNumber(100));

        const amountOutMinimum = BigInt(amountOutMinimumBigNumber.integerValue().toString());

        return prepareMulticallSwapExactInput({
            swapRouter,
            path: t.path,
            amountIn: t.quote.amountIn,
            amountOutMinimum,
            recipient: account,
            weth,
            deadline,
        });
    });

    const multicallTransaction = getMulticallSwapTransaction({
        swapRouter,
        recipient: account,
        transactions: swapTransactions,
    });

    const transactions = [...approvalTransactions, multicallTransaction];

    return {
        ...holdings,
        targetBalances: deltas,
        trades,
        totalTradeValue,
        transactions,
    };
}
