import { defineConfig } from "vite";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import ReactPlugin from "@vitejs/plugin-react-swc";
import CheckerPlugin from "vite-plugin-checker";
import SVGRPlugin from "vite-plugin-svgr";
import DTSPlugin from "vite-plugin-dts";
import { nodePolyfills, PolyfillOptions } from "vite-plugin-node-polyfills";
import path from "path";

// Plugin issue v0.17+ https://github.com/davidmyersdev/vite-plugin-node-polyfills/issues/81#issuecomment-2325104572
const nodePolyfillsFix = (options?: PolyfillOptions | undefined): Plugin => {
    return {
        ...nodePolyfills(options),
        //@ts-ignore
        resolveId(source: string) {
            const m = /^vite-plugin-node-polyfills\/shims\/(buffer|global|process)$/.exec(source);
            if (m) {
                return `node_modules/vite-plugin-node-polyfills/shims/${m[1]}/dist/index.cjs`;
            }
        },
    };
};

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        nodePolyfillsFix(),
        ReactPlugin(),
        TanStackRouterVite(),
        SVGRPlugin({
            svgrOptions: {
                icon: "100%",
            },
        }),
        //DTSPlugin(),
        CheckerPlugin({
            typescript: true, //TODO: Disable for now
            overlay: true,
            /*
        eslint: {
            lintCommand: 'eslint .  --ext .ts,.tsx',
        },
        */
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            jsbi: path.resolve(__dirname, ".", "node_modules", "jsbi", "dist", "jsbi-cjs.js"),
        },
    },
});
