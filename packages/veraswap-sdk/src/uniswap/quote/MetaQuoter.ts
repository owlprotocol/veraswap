import { AbiParametersToPrimitiveTypes } from "abitype";

import {
    metaQuoteExactInput as metaQuoteExactInputPayable,
    metaQuoteExactInputBest as metaQuoteExactInputBestPayable,
    metaQuoteExactInputSingle as metaQuoteExactInputSinglePayable,
    metaQuoteExactOutput as metaQuoteExactOutputPayable,
    metaQuoteExactOutputBest as metaQuoteExactOutputBestPayable,
    metaQuoteExactOutputSingle as metaQuoteExactOutputSinglePayable,
} from "../../artifacts/IV4MetaQuoter.js";

export enum MetaQuoteBestType {
    None = 0,
    Single = 1,
    Multihop = 2,
}

// View ABI for viem type inference
// Exact Single
export type MetaQuoteExactInputSingleAbi = Omit<typeof metaQuoteExactInputSinglePayable, "stateMutability"> & {
    stateMutability: "view";
};
export const metaQuoteExactInputSingle = metaQuoteExactInputSinglePayable as unknown as MetaQuoteExactInputSingleAbi;
export type MetaQuoteExactOutputSingleAbi = Omit<typeof metaQuoteExactOutputSinglePayable, "stateMutability"> & {
    stateMutability: "view";
};
export const metaQuoteExactOutputSingle = metaQuoteExactOutputSinglePayable as unknown as MetaQuoteExactOutputSingleAbi;

// Exact
export type MetaQuoteExactInputAbi = Omit<typeof metaQuoteExactInputPayable, "stateMutability"> & {
    stateMutability: "view";
};
export const metaQuoteExactInput = metaQuoteExactInputPayable as unknown as MetaQuoteExactInputAbi;
export type MetaQuoteExactOutputAbi = Omit<typeof metaQuoteExactOutputPayable, "stateMutability"> & {
    stateMutability: "view";
};
export const metaQuoteExactOutput = metaQuoteExactOutputPayable as unknown as MetaQuoteExactOutputAbi;

// Exact Best
export type MetaQuoteExactInputBestAbi = Omit<typeof metaQuoteExactInputBestPayable, "stateMutability"> & {
    stateMutability: "view";
};
export const metaQuoteExactInputBest = metaQuoteExactInputBestPayable as unknown as MetaQuoteExactInputBestAbi;
export type MetaQuoteExactOutputBestAbi = Omit<typeof metaQuoteExactOutputBestPayable, "stateMutability"> & {
    stateMutability: "view";
};
export const metaQuoteExactOutputBest = metaQuoteExactOutputBestPayable as unknown as MetaQuoteExactOutputBestAbi;

export type MetaQuoteExactBestParams = AbiParametersToPrimitiveTypes<(typeof metaQuoteExactInputBestPayable)["inputs"]>;
export type MetaQuoteExactBestReturnType = AbiParametersToPrimitiveTypes<
    (typeof metaQuoteExactInputBestPayable)["outputs"]
>;
export type MetaQuoteBestSingle = AbiParametersToPrimitiveTypes<MetaQuoteExactInputBestAbi["outputs"]>[0];
export type MetaQuoteBestMultihop = AbiParametersToPrimitiveTypes<MetaQuoteExactInputBestAbi["outputs"]>[1];
