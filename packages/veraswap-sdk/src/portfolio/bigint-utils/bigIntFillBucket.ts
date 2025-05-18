import { bigIntAbs } from "./bigIntAbs.js";

/**
 * - Let `a`, `b` an array of **positive sorted integers**
 * - Assume `sum(a) >= sum(b)`
 * - You may split the values in `a` and `b` into smaller positive integers
 * - Distribute the values of `a` into `b` such that `b[i] - a[j] = 0`
 * - The goal is to minimize the number of splits
 *
 * @warning This function assumes certain invariants (see **bold**)
 * @param arrA array of **positive sorted** integers
 * @param arrB array of **positive sorted** integersr
 * @param heuristic function that returns indices that are grouped as pair
 * @return list of tuples as `[[a_i, b_j, quantity], ...]`
 * @dev In practice, this algorithm is used to minimize the number of trades
 * when trying to shift portfolio distribution
 * @example ```typescript
 * const a = [15, 30, 30, 100]
 * const b = [1, 23, 38, 100]
 *
 * // List of tuples
 * // [[a_i, b_j, quantity], ...]
 * const result = bigIntFillBucket(a, b)
 *
 * const expected = [[3, 3, 100], [1, 1, 23], [1, 0, 1], [2, 2, 30], [1, 2, 6], [0, 2, 2]]
 * expect(result).toStrictEqual(expected)
 * ```
 */
export function bigIntFillBucket(
    a: bigint[],
    b: bigint[],
    heuristic: (a: bigint[], b: bigint[]) => [aIdx: number, bIdx: number, ...any] = heuristicWithTrivialCase(
        bigIntSmallestAbsDiff,
    ),
): [number, number, bigint][] {
    /**
     * The algorithm works as follows
     * - Find the pair with the smallest difference
     * - Update remaining values
     * - if > 0: re-insert into correct position
     * - if = 0: remove
     * - Continue until all integers are consumed from `a` or `b`
     */

    // copy array
    const arrA = [...a];
    const arrB = [...b];
    // pairs to return
    const pairs: [number, number, bigint][] = [];

    // track original indices as we shift elements in the array
    const aIds: number[] = [];
    for (let i = 0; i < arrA.length; i++) {
        aIds.push(i);
    }
    const bIds: number[] = [];
    for (let i = 0; i < arrB.length; i++) {
        bIds.push(i);
    }

    // let i = 0;
    while (arrA.length > 0 && arrB.length > 0) {
        // i++;
        // console.debug({ i, aIds, arrA, bIds, arrB, pairs });

        const [aIdx, bIdx] = heuristic(arrA, arrB);

        const aId = aIds[aIdx];
        const aVal = arrA[aIdx];

        const bId = bIds[bIdx];
        const bVal = arrB[bIdx];

        // update values
        if (aVal > bVal) {
            // add pair
            const pair: [number, number, bigint] = [aId, bId, bVal];
            pairs.push(pair);
            // update
            arrA.splice(aIdx, 1);
            aIds.splice(aIdx, 1);
            const aIdNewIdx = bigIntArrInsertIntoSorted(arrA, aVal - bVal);
            aIds.splice(aIdNewIdx, 0, aId);
            // remove
            arrB.splice(bIdx, 1);
            bIds.splice(bIdx, 1);
        } else if (bVal > aVal) {
            // add pair
            const pair: [number, number, bigint] = [aId, bId, aVal];
            pairs.push(pair);
            // remove
            arrA.splice(aIdx, 1);
            aIds.splice(aIdx, 1);
            // update
            arrB.splice(bIdx, 1);
            bIds.splice(bIdx, 1);
            const bIdNewIdx = bigIntArrInsertIntoSorted(arrB, bVal - aVal);
            bIds.splice(bIdNewIdx, 0, bId);
        } else {
            // add pair
            const pair: [number, number, bigint] = [aId, bId, aVal];
            pairs.push(pair);
            // remove
            arrA.splice(aIdx, 1);
            aIds.splice(aIdx, 1);
            arrB.splice(bIdx, 1);
            bIds.splice(bIdx, 1);
        }
    }

    return pairs;
}

/**
 * Return new heuristic with trivial case
 * @param heuristic
 * @returns
 */
export function heuristicWithTrivialCase(
    heuristic: (a: bigint[], b: bigint[]) => [aIdx: number, bIdx: number, ...any],
): (a: bigint[], b: bigint[]) => [aIdx: number, bIdx: number] {
    return function (a: bigint[], b: bigint[]): [aIdx: number, bIdx: number] {
        if (a.length === 1) {
            // trivial, return with max of b
            return [0, b.length - 1];
        } else if (b.length === 1) {
            // trivial, return with max of a
            return [a.length - 1, 0];
        } else {
            // heuristic
            return heuristic(a, b) as [aIdx: number, bIdx: number];
        }
    };
}

/**
 * Find `[a[i], b[j]]` such that `abs(a[i] - b[i])` is minimized
 * O(n) implementation
 * @warning This function assumes certain invariants (see **bold**)
 * @param a array of **positive sorted** integers
 * @param b array of **positive sorted** integers
 * @returns tuple of indices & finall diff value `[i, j, minDiff]`
 */
export function bigIntSmallestAbsDiff(a: bigint[], b: bigint[]): [number, number, bigint] {
    // initial min diff
    let minDiff = bigIntAbs(a[0] - b[0]);
    if (minDiff === 0n) return [0, 0, 0n];

    // a-index
    let aIdx = 0;
    // b-index
    let bIdx = 0;
    // find min diff
    let aIdxMinDiff = aIdx;
    let bIdxMinDiff = bIdx;

    // we increment `aIdx` or `bIdx` to scan for smallest difference
    while (aIdx < a.length && bIdx < b.length) {
        // absolute value of difference
        const diff = bigIntAbs(a[aIdx] - b[bIdx]);

        if (diff < minDiff) {
            // Found smaller difference
            aIdxMinDiff = aIdx;
            bIdxMinDiff = bIdx;
            minDiff = diff;
        }

        if (a[aIdx] > b[bIdx]) {
            // increment b[Idx] to close the gap
            bIdx += 1;
        } else if (a[aIdx] < b[bIdx]) {
            // increment a[Idx] to close the gap
            aIdx += 1;
        } else {
            // minDiff == 0n
            return [aIdxMinDiff, bIdxMinDiff, minDiff];
        }
    }

    return [aIdxMinDiff, bIdxMinDiff, minDiff];
}

/**
 * Insert `n` into **sorted** integer array
 * O(n) implementation
 * //TODO: Could do O(logn) implementation but prob not worth it?
 * @warning This function assumes certain invariants (see **bold**)
 * @param arr array of **sorted** integers
 * @param n
 * @return inserted index
 */
export function bigIntArrInsertIntoSorted(arr: bigint[], n: bigint): number {
    // index of first element greater than `n`
    let idx = arr.findIndex((e) => e > n);
    // insert to end of array if `n >= arr[i]` for all `i`
    if (idx === -1) idx = arr.length;
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
    arr.splice(idx, 0, n);

    return idx;
}
