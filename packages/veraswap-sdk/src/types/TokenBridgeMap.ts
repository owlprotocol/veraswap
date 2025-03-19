import { Address } from "viem";

interface TokenBridgeInfo {
    bridgeAddress?: Address;
    remotes: Record<number, Address>;
}

export type TokenBridgeMap = Record<number, Record<Address, TokenBridgeInfo>>;
