import { MockERC20 } from "@owlprotocol/veraswap-sdk/artifacts";
import { inkSepolia, interopDevnet0, interopDevnet1, unichainSepolia } from "@owlprotocol/veraswap-sdk/chains";
import { TOKENS } from "@owlprotocol/veraswap-sdk/constants";
import type { NextApiRequest, NextApiResponse } from "next";
import {
    Address,
    createPublicClient,
    createWalletClient,
    Hex,
    http,
    isAddress,
    nonceManager,
    parseEther,
    parseUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
    sepolia,
    arbitrumSepolia,
    base,
    arbitrum,
    baseSepolia,
    optimismSepolia,
} from "viem/chains";

const privateKey = process.env.PRIVATE_KEY;

export const prodChains = [
    {
        ...sepolia,
        rpcUrls: {
            default: {
                http: [
                    "https://lb.drpc.org/ogrpc?network=sepolia&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB",
                ],
                webSocket: [
                    "wss://lb.drpc.org/ogws?network=sepolia&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB",
                ],
            },
        },
    },
    {
        ...optimismSepolia,
        rpcUrls: {
            default: {
                http: [
                    "https://lb.drpc.org/ogrpc?network=optimism-sepolia&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB",
                ],
                webSocket: [
                    "wss://lb.drpc.org/ogws?network=optimism-sepolia&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB",
                ],
            },
        },
    },
    {
        ...arbitrumSepolia,
        rpcUrls: {
            default: {
                http: [
                    "https://lb.drpc.org/ogrpc?network=arbitrum-sepolia&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB",
                ],
                webSocket: [
                    "wss://lb.drpc.org/ogws?network=arbitrum-sepolia&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB",
                ],
            },
        },
    },
    {
        ...baseSepolia,
        rpcUrls: {
            default: {
                http: [
                    "https://lb.drpc.org/ogrpc?network=base-sepolia&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB",
                ],
                webSocket: [
                    "wss://lb.drpc.org/ogws?network=base-sepolia&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB",
                ],
            },
        },
    },
    interopDevnet0,
    interopDevnet1,
    base,
    arbitrum,
    inkSepolia,
    unichainSepolia,
] as const;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (!privateKey) {
        return res.status(500).end("Missing PRIVATE_KEY");
    }
    const { chainId, address } = req.query;
    const chainIdParsed = Number(chainId);

    if (Number.isNaN(chainIdParsed)) {
        return res.status(400).end("Invalid chainId");
    }

    if (!(typeof address === "string") || !isAddress(address)) {
        return res.status(400).end("Invalid address");
    }

    const receiver = address as Address;

    const chain = prodChains.find((chain) => chain.id === chainIdParsed);
    if (!chain) {
        return res.status(400).end("Chain not found");
    }

    if (chain.testnet === undefined || chain.testnet === false) {
        return res.status(400).end("Chain is not a testnet");
    }

    const walletClient = createWalletClient({
        account: privateKeyToAccount(privateKey as Hex, { nonceManager }),
        chain,
        transport: http(),
    });

    const publicClient = createPublicClient({
        chain,
        transport: http(),
    });

    const balance = await publicClient.getBalance({
        address: receiver,
    });

    const min = parseEther("0.0005");

    if (balance < min) {
        const hash = await walletClient.sendTransaction({
            to: address,
            value: (min * 150n) / 100n,
        });
        await publicClient.waitForTransactionReceipt({ hash });
        console.log(`Sent 0.00075 ETH to ${address}`);
    }

    const tokensForChain = Object.values(TOKENS).filter(
        (token) => token.chainId === chainIdParsed
    ) as Array<{ address: Address; decimals: number; symbol: string }>;

    for (const token of tokensForChain) {
        const balance = await publicClient.readContract({
            address: token.address,
            abi: MockERC20.abi,
            functionName: "balanceOf",
            args: [receiver],
        });

        const target = parseUnits("50", token.decimals);
        if (balance > target) {
            continue;
        }

        try {
            const hash = await walletClient.writeContract({
                address: token.address,
                abi: MockERC20.abi,
                functionName: "mint",
                args: [receiver, parseUnits("100", token.decimals)],
            });
            await publicClient.waitForTransactionReceipt({ hash });

            console.log(`Minted 100 ${token.symbol} to ${address}`);
        } catch (e) {
            console.log(`Failed to mint ${token.symbol} to ${address}: ${e}`);
            return res
                .status(500)
                .end(`Failed to mint ${token.symbol} to ${address}`);
        }
    }

    res.end(`Successfully dusted ${address}`);
}
