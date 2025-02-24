/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [],
    test: {
        //environment: "jsdom",
        globals: false,
        globalSetup: "vitest.setup.ts",
        testTimeout: 60000,
        hookTimeout: 60000,
        watch: true,
        include: ["src/**/*.test.ts"],
        poolOptions: {
            threads: {
                singleThread: true,
            },
        },
        //setupFiles: "./src/test/setup.ts",
    },
});
