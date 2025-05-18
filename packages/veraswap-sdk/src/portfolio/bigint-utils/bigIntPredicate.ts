/**
 * Predicate to sort in ascending order
 * @param a
 * @param b
 * @returns
 */
export function bigIntPredicate(a: bigint, b: bigint): -1 | 0 | 1 {
    if (a < b) return -1;
    else if (a > b) return 1;
    else return 0;
}
