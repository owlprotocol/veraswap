import { describe, test } from "vitest";

describe("smartaccount/index.test.ts", function () {
    // Test ZeroDev SDK & Custom SDK Tooling

    /**
     * TODO
     * - Kernel deploy with Executor
     * - Execute via Direct Call
     * - Execute via Signature
     * - Execute via ERC7579 Router (set Mailbox as EOA)
     * 
     * - Kernel deploy via ERC7579 Router
     */

    describe("OwnableExecutor", () => {
        test("installOwnableExecutor", () => {

        })

        test("OwnableExecutor.executeOnOwnedAccount - direct", () => {

        })

        test("OwnableExecutor.executeBatchOnOwnedAccount - direct", () => {

        })

        test("OwnableExecutor.executeOnOwnedAccount - signature", () => {

        })

        test("OwnableExecutor.executeBatchOnOwnedAccount - signature", () => {

        })
    })

    describe("ERC7579Router", () => {
        test("ERC7579 Router - Account Init", () => {

        })
    })
})