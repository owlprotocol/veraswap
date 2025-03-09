import { Address } from "viem";
import { tokenBridgeMap } from "../constants.js";

export const getRemoteTokenAddressAndBridge = (chainId: number, address: Address, remoteChainId: number) => {
    const chainMap = tokenBridgeMap[chainId];

    if (!chainMap) return null;

    const tokenBridgeInfo = chainMap[address];
    if (!tokenBridgeInfo) return null;

    const remoteTokenAddress = tokenBridgeInfo.remotes[remoteChainId];

    if (remoteTokenAddress) {
        const remoteToken = tokenBridgeMap[remoteChainId][remoteTokenAddress];
        const remoteBridgeAddress = remoteToken.bridgeAddress;

        return { remoteTokenAddress, remoteBridgeAddress };
    }
    return null;
};

export const isSyntheticToken = (chainId: number, address: Address): boolean => {
    const chainMap = tokenBridgeMap[chainId];
    if (!chainMap) return false;

    const tokenInfo = chainMap[address];
    if (!tokenInfo) return false;

    return !tokenInfo.bridgeAddress || tokenInfo.bridgeAddress === address;
};
