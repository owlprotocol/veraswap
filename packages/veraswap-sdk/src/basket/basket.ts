import { Address } from "viem";

export interface Basket {
    name: string;
    tokens: {
        chainId: number;
        address: Address;
        weight: number;
    }[];
}
