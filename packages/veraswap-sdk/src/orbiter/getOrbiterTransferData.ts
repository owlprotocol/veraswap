import { Address, stringToHex } from "viem";

// Should be all lowercase
const PUBLIC_ADDRESS_UTILITY = "0xa2e8b0ae8b5a51d494ecf7e35f3734a6ced7eecf";

export function getOrbiterTransferData({
    orbiterChainId,
    recipient,
    app = PUBLIC_ADDRESS_UTILITY,
}: {
    orbiterChainId: number;
    recipient?: Address;
    app?: Address;
}) {
    const identificationCode = 9000 + orbiterChainId;

    const chainAndApp = `c=${identificationCode}&app=${app}`;
    const transferDataString = recipient ? `${chainAndApp}&t=${recipient}` : chainAndApp;
    return stringToHex(transferDataString);
}
