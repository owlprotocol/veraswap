import { AbiParameterToPrimitiveType } from "viem";

import { quoteOFT } from "../artifacts/IStargate.js";

export type StargateSendParam = AbiParameterToPrimitiveType<(typeof quoteOFT)["inputs"][0]>;
