import { IERC20 } from "@owlprotocol/contracts-hyperlane";
import {
    Address,
    createPublicClient,
    createWalletClient,
    formatUnits,
    Hex,
    http,
    nonceManager,
    parseUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { MockERC20 } from "../artifacts/MockERC20.js";
import { opChainL1 } from "../chains/index.js";

export async function mintToAddress() {
    if (process.argv.length < 5) {
        console.error("Usage: mintToAddress.ts <tokenAddress> <receiver> <amount>");
        return;
    }

    const address = process.argv[2] as Address;
    const receiver = process.argv[3] as Address;
    const amount = process.argv[4];

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) throw new Error("PRIVATE_KEY is required");

    // const chain = { ...sepolia, rpcUrls: { default: { http: ["https://sepolia.drpc.org"] } } };
    const chain = opChainL1;

    const walletClient = createWalletClient({
        chain,
        transport: http(),
        account: privateKeyToAccount(privateKey as Hex, { nonceManager }),
    });

    const publicClient = createPublicClient({ chain, transport: http() });

    const decimals = await publicClient.readContract({
        abi: MockERC20.abi,
        address,
        functionName: "decimals",
    });

    const symbol = await publicClient.readContract({
        abi: MockERC20.abi,
        address,
        functionName: "symbol",
    });

    const hash = await walletClient.writeContract({
        abi: MockERC20.abi,
        address,
        functionName: "mint",
        args: [receiver, parseUnits(amount, decimals)],
    });

    await publicClient.waitForTransactionReceipt({ hash });

    const balance = await publicClient.readContract({
        abi: IERC20.abi,
        address,
        functionName: "balanceOf",
        args: [receiver],
    });

    console.log(`New balance for ${receiver} is ${formatUnits(balance, decimals)} ${symbol}`);
}

mintToAddress()
    .then(() => process.exit())
    .catch(console.error);
