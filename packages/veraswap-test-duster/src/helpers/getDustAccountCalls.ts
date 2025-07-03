import { MockERC20 } from "@owlprotocol/veraswap-sdk/artifacts";
import type { CallArgs, Currency } from "@owlprotocol/veraswap-sdk";
import {
    isMultichainToken,
    MultichainToken,
    Token,
} from "@owlprotocol/veraswap-sdk";
import {
    Address,
    PublicClient,
    encodeFunctionData,
    parseEther,
    parseUnits,
    Chain,
    Transport,
} from "viem";

const DUST_MIN_ETH = parseEther("0.02");
const DUST_AMOUNT_ETH = (DUST_MIN_ETH * 150n) / 100n;

export async function getDustAccountCalls({
    account,
    client,
    currencies,
}: {
    account: Address;
    client: PublicClient<Transport, Chain>;
    currencies: Currency[];
}): Promise<CallArgs[]> {
    const calls: CallArgs[] = [];

    let filteredTokens = currencies.filter(
        (token) =>
            token.chainId === client.chain.id &&
            token instanceof Token &&
            (!isMultichainToken(token) ||
                token.standard === "ERC20" ||
                token.standard === "SuperERC20")
    ) as (Token | MultichainToken)[];

    if (
        client.chain.id === 900 ||
        client.chain.id === 901 ||
        client.chain.id === 902
    ) {
        // Dev environment, check if tokens exist
        const filteredTokenExists = await Promise.all(
            filteredTokens.map(async (token) => {
                console.log({ token, chainId: client.chain.id });
                const code = await client.getCode({ address: token.address });
                return !!code;
            })
        );
        filteredTokens = filteredTokens.filter(
            (_, idx) => filteredTokenExists[idx]
        );
    }

    const ethBalancePromise = client.getBalance({ address: account });
    const tokenBalancePromises = filteredTokens.map((token) =>
        client
            .readContract({
                address: token.address,
                abi: MockERC20.abi,
                functionName: "balanceOf",
                args: [account],
            })
            .catch((e) => {
                console.error(
                    `Error fetching balance for token ${token.name} on chain ${token.chainId}:`,
                    e
                );
                throw e;
            })
    );

    const [ethBalance, ...tokenBalances] = await Promise.all([
        ethBalancePromise,
        ...tokenBalancePromises,
    ]);

    if (ethBalance < DUST_MIN_ETH) {
        calls.push({
            to: account,
            value: DUST_AMOUNT_ETH,
            data: "0x",
        });
    }

    for (let i = 0; i < filteredTokens.length; i++) {
        const token = filteredTokens[i];
        const balance = tokenBalances[i] as bigint;

        if (balance === 0n) {
            const data = encodeFunctionData({
                abi: MockERC20.abi,
                functionName: "mint",
                args: [account, parseUnits("100", token.decimals)],
            });

            calls.push({
                to: token.address,
                data,
            });
        }
    }

    return calls;
}
