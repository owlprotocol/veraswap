import { AbiParametersToPrimitiveTypes } from "abitype";

import {
    metaQuoteExactInput as metaQuoteExactInputPayable,
    metaQuoteExactInputBest as metaQuoteExactInputBestPayable,
    metaQuoteExactInputSingle as metaQuoteExactInputSinglePayable,
    metaQuoteExactOutput as metaQuoteExactOutputPayable,
    metaQuoteExactOutputBest as metaQuoteExactOutputBestPayable,
    metaQuoteExactOutputSingle as metaQuoteExactOutputSinglePayable,
} from "../artifacts/IV4MetaQuoter.js";

export enum V4MetaQuoteBestType {
    None = 0,
    Single = 1,
    Multihop = 2,
}

// View ABI for viem type inference

// Exact Single
export type V4MetaQuoteExactInputSingleAbi = Omit<typeof metaQuoteExactInputSinglePayable, "stateMutability"> & {
    stateMutability: "view";
};
export const metaQuoteExactInputSingle = metaQuoteExactInputSinglePayable as unknown as V4MetaQuoteExactInputSingleAbi;
export type V4MetaQuoteExactOutputSingleAbi = Omit<typeof metaQuoteExactOutputSinglePayable, "stateMutability"> & {
    stateMutability: "view";
};
export const metaQuoteExactOutputSingle =
    metaQuoteExactOutputSinglePayable as unknown as V4MetaQuoteExactOutputSingleAbi;

// Exact
export type V4MetaQuoteExactInputAbi = Omit<typeof metaQuoteExactInputPayable, "stateMutability"> & {
    stateMutability: "view";
};
export const metaQuoteExactInput = metaQuoteExactInputPayable as unknown as V4MetaQuoteExactInputAbi;
export type V4MetaQuoteExactOutputAbi = Omit<typeof metaQuoteExactOutputPayable, "stateMutability"> & {
    stateMutability: "view";
};
export const metaQuoteExactOutput = metaQuoteExactOutputPayable as unknown as V4MetaQuoteExactOutputAbi;

// Exact Best
export type V4MetaQuoteExactInputBestAbi = Omit<typeof metaQuoteExactInputBestPayable, "stateMutability"> & {
    stateMutability: "view";
};
export const metaQuoteExactInputBest = metaQuoteExactInputBestPayable as unknown as V4MetaQuoteExactInputBestAbi;
export type V4MetaQuoteExactOutputBestAbi = Omit<typeof metaQuoteExactOutputBestPayable, "stateMutability"> & {
    stateMutability: "view";
};
export const metaQuoteExactOutputBest = metaQuoteExactOutputBestPayable as unknown as V4MetaQuoteExactOutputBestAbi;

//TODO: Remove these an not necessary
export type V4MetaQuoteExactSingleParams = AbiParametersToPrimitiveTypes<
    (typeof metaQuoteExactInputSinglePayable)["inputs"]
>;
export type V4MetaQuoteExactSingleReturnType = AbiParametersToPrimitiveTypes<
    (typeof metaQuoteExactInputSinglePayable)["outputs"]
>[number];

export type V4MetaQuoteExactParams = AbiParametersToPrimitiveTypes<(typeof metaQuoteExactInput)["inputs"]>;
export type V4MetaQuoteExactReturnType = AbiParametersToPrimitiveTypes<(typeof metaQuoteExactInput)["outputs"]>[number];

export type V4MetaQuoteExactBestParams = AbiParametersToPrimitiveTypes<
    (typeof metaQuoteExactInputBestPayable)["inputs"]
>;
export type V4MetaQuoteExactBestReturnType = AbiParametersToPrimitiveTypes<
    (typeof metaQuoteExactInputBestPayable)["outputs"]
>;
