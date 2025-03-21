import { TokenRouter } from "@owlprotocol/contracts-hyperlane";
import { Address, createPublicClient, createWalletClient, Hex, http, nonceManager, padHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

export async function enrollRemoteRouter() {
    if (process.argv.length < 5) {
        console.error("Usage: enrollRemote.ts <tokenAddress> <destinationChain> <remoteAddress>");
        return;
    }

    const address = process.argv[2] as Address;
    const destinationChain = Number(process.argv[3]);
    const remoteAddress = process.argv[4] as Address;

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) throw new Error("PRIVATE_KEY is required");

    // const chain = arbitrumSepolia;
    const chain = { ...sepolia, rpcUrls: { default: { http: ["https://sepolia.drpc.org"] } } };

    const walletClient = createWalletClient({
        chain,
        transport: http(),
        account: privateKeyToAccount(privateKey as Hex, { nonceManager }),
    });

    const publicClient = createPublicClient({ chain, transport: http() });

    const hash = await walletClient.writeContract({
        abi: TokenRouter.abi,
        address,
        functionName: "enrollRemoteRouter",
        args: [destinationChain, padHex(remoteAddress, { size: 32 })],
    });

    await publicClient.waitForTransactionReceipt({ hash });

    const domains = await publicClient.readContract({
        abi: TokenRouter.abi,
        address,
        functionName: "domains",
    });

    console.log(`Bridge at address ${address} now has domains:`, domains);
}

// enrollRemoteRouter().then(() => process.exit());
