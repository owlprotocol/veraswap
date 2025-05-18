import { describe, expect, test } from "vitest";

import {
    bigIntArrInsertIntoSorted,
    bigIntFillBucket,
    bigIntSmallestAbsDiff,
    heuristicWithTrivialCase,
} from "./bigIntFillBucket.js";

describe("bigIntFillBucket.test.ts", function () {
    describe("bigIntFillBucket", () => {
        test("max", () => {
            const a = [15n, 30n, 30n, 100n];
            const b = [1n, 23n, 38n, 100n];

            // List of tuples
            // [[a_i, b_j, quantity], ...]
            const result = bigIntFillBucket(a, b, (a, b) => [a.length - 1, b.length - 1]);
            const expected = [
                [3, 3, 100n],
                [2, 2, 30n],
                [1, 1, 23n],
                [0, 2, 8n],
                [0, 0, 1n],
            ];
            expect(result).toStrictEqual(expected);
        });

        test("max - suboptimal", () => {
            const a = [100n, 120n];
            const b = [30n, 90n, 100n];

            // List of tuples
            // [[a_i, b_j, quantity], ...]
            const result = bigIntFillBucket(a, b, (a, b) => [a.length - 1, b.length - 1]);

            // sub-optimal (try algo with pen & paper)
            // could be in 3 pairs, 100/100, 90/90, 30/30
            const expected = [
                [1, 2, 100n],
                [0, 1, 90n],
                [1, 0, 20n],
                [0, 0, 10n],
            ];
            expect(result).toStrictEqual(expected);
        });

        test("bigIntSmallesAbsDiff - suboptimal", () => {
            const a = [15n, 30n, 30n, 100n];
            const b = [1n, 23n, 38n, 100n];

            // List of tuples
            // [[a_i, b_j, quantity], ...]
            const result = bigIntFillBucket(a, b, bigIntSmallestAbsDiff);
            // sub-optimal (try algo with pen & paper)
            const expected = [
                [3, 3, 100n],
                [1, 1, 23n],
                [1, 0, 1n],
                [2, 2, 30n],
                // These two pairs could be combined as [0, 2, 8n]
                [1, 2, 6n],
                [0, 2, 2n],
            ];
            expect(result).toStrictEqual(expected);
        });

        test("bigIntSmallesAbsDiff + trivial", () => {
            const a = [15n, 30n, 30n, 100n];
            const b = [1n, 23n, 38n, 100n];

            // List of tuples
            // [[a_i, b_j, quantity], ...]
            const result = bigIntFillBucket(a, b, heuristicWithTrivialCase(bigIntSmallestAbsDiff));
            const expected = [
                [3, 3, 100n],
                [1, 1, 23n],
                [1, 0, 1n],
                [2, 2, 30n],
                [0, 2, 8n],
            ];
            expect(result).toStrictEqual(expected);
        });
    });

    test("bigIntSmallestAbsDiff", () => {
        const a = [5n, 10n, 50n];
        const b = [1n, 3n, 9n, 100n];
        const [aIdx, bIdx, diff] = bigIntSmallestAbsDiff(a, b);

        expect(aIdx).toBe(1);
        expect(bIdx).toBe(2);
        expect(diff).toBe(1n);
    });

    test("bigIntArrInsertIntoSorted", () => {
        const arr = [1n, 2n, 4n, 5n];

        // Insert in middle
        const idx1 = bigIntArrInsertIntoSorted(arr, 3n);
        expect(arr).toStrictEqual([1n, 2n, 3n, 4n, 5n]);
        expect(idx1).toBe(2);

        // Insert in front
        const idx2 = bigIntArrInsertIntoSorted(arr, 0n);
        expect(arr).toStrictEqual([0n, 1n, 2n, 3n, 4n, 5n]);
        expect(idx2).toBe(0);

        // Insert in back
        const idx3 = bigIntArrInsertIntoSorted(arr, 6n);
        expect(arr).toStrictEqual([0n, 1n, 2n, 3n, 4n, 5n, 6n]);
        expect(idx3).toBe(6);
    });
});
