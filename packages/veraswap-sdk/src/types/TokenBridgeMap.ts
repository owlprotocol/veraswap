import { Address } from "viem";

type TokenBridgeInfo = {
    bridgeAddress: Address;
    remotes: Record<number, Address>;
};

export type TokenBridgeMap = Record<number, Record<Address, TokenBridgeInfo>>;
