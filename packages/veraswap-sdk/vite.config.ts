/// <reference types="vitest" />
import { defineConfig } from "vite";
import { loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
    plugins: [react()],
    test: {
        //environment: "jsdom",
        globals: false,
        globalSetup: "vitest.setup.ts",
        testTimeout: 60000,
        hookTimeout: 60000,
        watch: true,
        include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
        exclude: ["src/alto.test.ts"],
        poolOptions: {
            threads: {
                singleThread: true,
            },
        },
        env: loadEnv("", process.cwd(), ""),
        //setupFiles: "./src/test/setup.ts",
    },
});
