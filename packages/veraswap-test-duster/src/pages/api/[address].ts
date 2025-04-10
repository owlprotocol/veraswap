import { prodChains, localChains } from "@/config/chains";
import { Execute } from "@owlprotocol/veraswap-sdk/artifacts";
import { localMockTokens, testnetMockTokens } from "@owlprotocol/veraswap-sdk/constants";
import type { NextApiRequest, NextApiResponse } from "next";
import { getExecMode } from "@zerodev/sdk";
import { CALL_TYPE, EXEC_TYPE } from "@zerodev/sdk/constants";
import {
    Address,
    Chain,
    Hex,
    PublicClient,
    Transport,
    createPublicClient,
    createWalletClient,
    encodeFunctionData,
    http,
    isAddress,
    nonceManager,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { Token, LOCAL_KERNEL_CONTRACTS, encodeCallArgsBatch } from "@owlprotocol/veraswap-sdk";
import { getDustAccountCalls } from "@/helpers/getDustAccountCalls";

const privateKey = process.env.PRIVATE_KEY;
const chains = (process.env.NODE_ENV === "development" ? localChains : prodChains).filter((c) => c.testnet);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (!privateKey) return res.status(500).end("Missing PRIVATE_KEY");

    const { address } = req.query;
    if (typeof address !== "string" || !isAddress(address)) {
        return res.status(400).end("Invalid address");
    }

    const receiver = address as Address;

    const dustingResults = await Promise.allSettled(
        chains.map(async (chain) => {
            const walletClient = createWalletClient({
                account: privateKeyToAccount(privateKey as Hex, { nonceManager }),
                chain,
                transport: http(),
            });

            const publicClient = createPublicClient({
                chain,
                transport: http(),
            });

            const tokens = Object.values([...localMockTokens, ...testnetMockTokens]).filter(
                (token) => token.chainId === chain.id
            ) as Token[];

            const calls = await getDustAccountCalls({
                account: receiver,
                client: publicClient as PublicClient<Transport, Chain>,
                tokens,
            });

            if (calls.length === 0) return { chainId: chain.id, result: "Nothing to dust" };

            if (calls.length === 1) {
                const call = calls[0];
                const hash = await walletClient.sendTransaction({
                    to: call.to,
                    value: call.value ?? 0n,
                    data: call.data ?? "0x",
                });
                await publicClient.waitForTransactionReceipt({ hash });
                return { chainId: chain.id, result: "Successfully dusted (single)" };
            }

            const executeData = encodeCallArgsBatch(calls);
            const totalValue = calls.reduce((acc, call) => acc + (call.value ?? 0n), 0n);

            const data = encodeFunctionData({
                abi: Execute.abi,
                functionName: "execute",
                args: [getExecMode({ callType: CALL_TYPE.BATCH, execType: EXEC_TYPE.DEFAULT }), executeData],
            });

            const hash = await walletClient.sendTransaction({
                to: LOCAL_KERNEL_CONTRACTS.execute,
                value: totalValue,
                data,
            });

            await publicClient.waitForTransactionReceipt({ hash });
            return { chainId: chain.id, result: "Successfully dusted (batch)" };
        })
    );

    const results: Record<number, string> = {};

    dustingResults.forEach((res, idx) => {
        const chain = chains[idx];
        const chainId = chain.id;

        if (res.status === "fulfilled") {
            results[res.value.chainId] = res.value.result;
        } else {
            console.error(`Error on chain ${chainId}:`, res.reason);
            results[chainId] = `Error: ${(res.reason as Error).message || "Unknown error"}`;
        }
    });


    return res.status(200).json(results);
}
