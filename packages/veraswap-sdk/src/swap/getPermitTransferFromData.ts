import { SignatureTransfer, PERMIT2_ADDRESS } from "@uniswap/permit2-sdk";
import { Account, Address, bytesToBigInt, Chain, encodeFunctionData, Transport, WalletClient } from "viem";
import { permitTransferFrom as permitTransferFromAbi } from "../artifacts/ISignatureTransfer.js";

export async function getPermitTransferFromData(
    walletClient: WalletClient<Transport, Chain, Account>,
    {
        chainId,
        spender,
        currencyInAddress,
        amountIn,
    }: {
        chainId: number;
        spender: Address;
        currencyInAddress: Address;
        amountIn: bigint;
    },
) {
    const permitTransferFromNonce = bytesToBigInt(crypto.getRandomValues(new Uint8Array(32)));
    const permitTransferFrom = {
        permitted: {
            token: currencyInAddress,
            amount: amountIn,
        },
        spender,
        nonce: permitTransferFromNonce,
        deadline: BigInt(Math.floor(Date.now() / 1000) + 60),
    };

    const permitData = SignatureTransfer.getPermitData(permitTransferFrom, PERMIT2_ADDRESS, chainId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const permitTransferSignature = await walletClient.signTypedData({
        domain: permitData.domain,
        types: permitData.types,
        primaryType: "PermitTransferFrom",
        message: permitData.values,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const permitTransferDetails = { to: spender, requestedAmount: amountIn };

    return {
        dest: PERMIT2_ADDRESS as unknown as Address,
        value: 0n,
        func: encodeFunctionData({
            abi: [permitTransferFromAbi],
            functionName: "permitTransferFrom",
            args: [permitTransferFrom, permitTransferDetails, walletClient.account.address, permitTransferSignature],
        }),
    };
}
