import { AbiParametersToPrimitiveTypes } from "abitype";

import { metaQuoteExactInput, metaQuoteExactInputBest, metaQuoteExactInputSingle } from "../artifacts/IV4MetaQuoter.js";

export enum V4MetaQuoteBestType {
    None = 0,
    Single = 1,
    Multihop = 2,
}

export type V4MetaQuoteExactSingleParams = AbiParametersToPrimitiveTypes<(typeof metaQuoteExactInputSingle)["inputs"]>;
export type V4MetaQuoteExactSingleReturnType = AbiParametersToPrimitiveTypes<
    (typeof metaQuoteExactInputSingle)["outputs"]
>[number];

export type V4MetaQuoteExactParams = AbiParametersToPrimitiveTypes<(typeof metaQuoteExactInput)["inputs"]>;
export type V4MetaQuoteExactReturnType = AbiParametersToPrimitiveTypes<(typeof metaQuoteExactInput)["outputs"]>[number];

export type V4MetaQuoteExactBestParams = AbiParametersToPrimitiveTypes<(typeof metaQuoteExactInputBest)["inputs"]>;
export type V4MetaQuoteExactBestReturnType = AbiParametersToPrimitiveTypes<(typeof metaQuoteExactInputBest)["outputs"]>;
