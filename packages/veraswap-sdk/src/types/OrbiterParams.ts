import { Address } from "viem";

export interface OrbiterParams {
    endpoint: Address;
    endpointContract: Address;
    orbiterChainId: number;
}
