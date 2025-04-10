import { prodChains, localChains } from "@/config/chains";
import { MockERC20, Execute } from "@owlprotocol/veraswap-sdk/artifacts";
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
    parseUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { Token, LOCAL_KERNEL_CONTRACTS, encodeCallArgsBatch } from "@owlprotocol/veraswap-sdk";
import { getDustAccountCalls } from "@/helpers/getDustAccountCalls";


const privateKey = process.env.PRIVATE_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (!privateKey) return res.status(500).end("Missing PRIVATE_KEY");

    const { chainId, address } = req.query;
    const chainIdParsed = Number(chainId);
    if (Number.isNaN(chainIdParsed)) return res.status(400).end("Invalid chainId");
    if (!(typeof address === "string") || !isAddress(address)) return res.status(400).end("Invalid address");

    const receiver = address as Address;
    const chains = process.env.NODE_ENV === "development" ? localChains : prodChains;
    const chain = chains.find((c) => c.id === chainIdParsed);
    if (!chain) return res.status(400).end("Chain not found");
    if (!chain.testnet) return res.status(400).end("Chain is not a testnet");

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
        (token) => token.chainId === chainIdParsed
    ) as Token[];


    const calls = await getDustAccountCalls({
        account: receiver,
        client: publicClient as PublicClient<Transport, Chain>,
        tokens,
    });


    if (calls.length === 0) res.status(200).send("Nothing to dust");

    if (calls.length === 1) {
        const call = calls[0];
        if (!call.data) {
            const hash = await walletClient.sendTransaction({
                to: call.to,
                value: call.value!,
            });
            await publicClient.waitForTransactionReceipt({ hash });
        } else {
            const hash = await walletClient.writeContract({
                address: call.to,
                abi: MockERC20.abi,
                functionName: "mint",
                args: [receiver, parseUnits("100", 18)],
            });
            await publicClient.waitForTransactionReceipt({ hash });
        }
        res.status(200).send("Successfully dusted");
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

    res.status(200).send("Successfully dusted with batching");
}
