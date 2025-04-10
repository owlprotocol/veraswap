import { MockERC20 } from "@owlprotocol/veraswap-sdk/artifacts";
import type { CallArgs, Token } from "@owlprotocol/veraswap-sdk";
import {
    Address,
    PublicClient,
    encodeFunctionData,
    parseEther,
    parseUnits,
    Chain,
    Transport,
} from "viem";


const DUST_MIN_ETH = parseEther("0.0005");
const DUST_AMOUNT_ETH = (DUST_MIN_ETH * 150n) / 100n

export async function getDustAccountCalls({
    account,
    client,
    tokens,
}: {
    account: Address;
    client: PublicClient<Transport, Chain>;
    tokens: Token[];
}): Promise<CallArgs[]> {
    const calls: CallArgs[] = [];

    const filteredTokens = tokens.filter(
        (token) => token.chainId === client.chain?.id && token.standard === "MockERC20",
    );

    const ethBalancePromise = client.getBalance({ address: account });
    const tokenBalancePromises = filteredTokens.map((token) =>
        client.readContract({
            address: token.address,
            abi: MockERC20.abi,
            functionName: "balanceOf",
            args: [account],
        }),
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
