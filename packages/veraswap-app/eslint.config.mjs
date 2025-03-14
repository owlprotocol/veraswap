import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-plugin-prettier";
import _import from "eslint-plugin-import";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: ["**/lib", "**/dist", "**/public", "**/storybook-static", "**/cache"],
}, ...fixupConfigRules(compat.extends(
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "plugin:import/typescript",
    "plugin:react-hooks/recommended",
)), {
    plugins: {
        "@typescript-eslint": fixupPluginRules(typescriptEslint),
        prettier: fixupPluginRules(prettier),
        import: fixupPluginRules(_import),
        "react-hooks": fixupPluginRules(reactHooks),
        "react-refresh": reactRefresh,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
        },

        parser: tsParser,
        ecmaVersion: 2018,
        sourceType: "module",
    },

    settings: {
        "import/parsers": {
            "@typescript-eslint/parser": [".ts"],
        },

        "import/resolver": {},
        "import/extensions": [".js", ".mjs", ".ts"],
    },

    rules: {
        "linebreak-style": ["error", "unix"],
        "no-console": "off",
        "no-unused-vars": "off",
        "no-empty": "warn",

        "import/extensions": ["warn", "ignorePackages", {
            json: "always",
        }],

        "import/no-named-as-default": "off",
        "import/no-commonjs": "error",
        "import/no-default-export": ["off"],
        "import/no-anonymous-default-export": "error",
        "import/no-cycle": "error",
        "import/no-self-import": "error",

        "import/no-unresolved": ["off", {
            ignore: [".js$"],
        }],

        "import/no-internal-modules": ["off", {
            allow: [".json$"],
        }],

        "import/order": ["warn", {
            groups: ["external", "builtin", "internal", "sibling", "parent", "index"],
        }],

        "node/no-extraneous-import": "off",
        "node/no-unsupported-features/es-syntax": "off",
        "node/no-unsupported-features/node-builtins": "off",
        "node/no-unpublished-import": "off",
        "node/no-missing-import": "off",

        "node/file-extension-in-import": ["off", "always", {
            tryExtensions: [".js", ".ts", ".node"],
        }],

        "@typescript-eslint/no-unused-vars": ["off"],
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/ban-ts-comment": "off",

        "react-refresh/only-export-components": ["warn", {
            allowConstantExport: true,
        }],
    },
}];