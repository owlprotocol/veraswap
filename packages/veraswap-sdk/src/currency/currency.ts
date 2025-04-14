import { MultichainToken } from "./multichainToken.js";
import { NativeCurrency } from "./nativeCurrency.js";
import { Token } from "./token.js";

export type Currency = NativeCurrency | Token | MultichainToken;
