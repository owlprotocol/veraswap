import { defineConfig } from "vite";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import ReactPlugin from "@vitejs/plugin-react-swc";
import CheckerPlugin from "vite-plugin-checker";
import SVGRPlugin from "vite-plugin-svgr";
import DTSPlugin from "vite-plugin-dts";
import { dotenvConfig } from "@owlprotocol/envvars";
import path from "path";

dotenvConfig();

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
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
        },
    },
});
