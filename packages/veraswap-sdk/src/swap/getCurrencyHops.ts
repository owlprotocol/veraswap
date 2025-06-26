import { Address, zeroAddress } from "viem";

import { CURRENCY_HOPS } from "../constants/contracts.js";

export function getCurrencyHops(chainId: number): Address[] {
    if (chainId in CURRENCY_HOPS) return CURRENCY_HOPS[chainId as keyof typeof CURRENCY_HOPS];

    return [zeroAddress];
}
