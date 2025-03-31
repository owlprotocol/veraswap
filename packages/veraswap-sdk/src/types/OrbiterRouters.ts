import { Address } from "viem";

export interface OrbiterRouters {
    /** The address that relays the bridged token (AKA maker address) */
    endpoint: Address;
    /** The Orbiter bridging contract */
    endpointContract: Address | null;
    /** format: srcChain/dstChain-srcTokenSymbol/dstTokenSymbol */
    line: string;
    maxAmt: string;
    minAmt: string;
    srcChain: string;
    srcToken: Address;
    state: "available" | "disabled";
    tgtChain: string;
    tgtToken: Address;
    tradeFee: string;
    vc: string;
    withholdingFee: string;
}
