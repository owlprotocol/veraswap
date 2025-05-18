import { AbiParametersToPrimitiveTypes } from "abitype";

import { metaQuoteExactInput } from "../artifacts/IV4MetaQuoter.js";

export type V4MetaQuoteParams = AbiParametersToPrimitiveTypes<(typeof metaQuoteExactInput)["inputs"]>;
export type V4MetaQuoteReturnType = AbiParametersToPrimitiveTypes<(typeof metaQuoteExactInput)["outputs"]>;
