import { BaseCurrency } from "./baseCurrency.js";

/**
 * Represents the native currency of the chain on which it resides, e.g.
 */
export abstract class NativeCurrency extends BaseCurrency {
    public readonly isNative = true as const;
    public readonly isToken = false as const;
}
