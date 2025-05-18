/**
 * Return bigint absolute value similar to `Math.abs()`
 * @param n
 * @returns `n` if  `n >= 0`, else `-n`
 */
export function bigIntAbs(n: bigint): bigint {
    return n >= 0 ? n : -n;
}
