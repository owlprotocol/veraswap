import { MultichainToken } from "./multichainToken.js";
import { NativeCurrency } from "./nativeCurrency.js";
import { Token2 } from "./token.js";

export type Currency = NativeCurrency | Token2 | MultichainToken;
