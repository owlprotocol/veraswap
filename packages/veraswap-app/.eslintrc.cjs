module.exports = {
    env: {
        browser: true,
        es2020: true,
    },
    parser: "@typescript-eslint/parser", // Specifies the ESLint parser
    extends: [
        "plugin:@typescript-eslint/recommended", // Uses the recommended rules from @typescript-eslint/eslint-plugin
        "plugin:prettier/recommended",
        "plugin:import/typescript",
        "plugin:react-hooks/recommended",
    ],
    plugins: [
        "@typescript-eslint",
        "prettier",
        "import",
        "react-hooks",
        "react-refresh",
    ],
    parserOptions: {
        ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
        sourceType: "module", // Allows for the use of imports
    },
    rules: {
        "linebreak-style": ["error", "unix"],
        "no-console": "off",
        "no-unused-vars": "off",
        "no-empty": "warn",
        "import/extensions": ["warn", "ignorePackages", { json: "always" }],
        "import/no-named-as-default": "off",
        "import/no-commonjs": "error",
        "import/no-default-export": ["off"],
        "import/no-anonymous-default-export": "error",
        "import/no-cycle": "error",
        "import/no-self-import": "error",
        "import/no-unresolved": ["off", { ignore: [".js$"] }],
        "import/no-internal-modules": [
            "off",
            {
                allow: [".json$"],
            },
        ],
        //https://dev.to/diballesteros/how-to-quickly-configure-eslint-for-import-sorting-2h73
        "import/order": [
            "warn",
            {
                groups: [
                    "external",
                    "builtin",
                    "internal",
                    "sibling",
                    "parent",
                    "index",
                ],
            },
        ],
        "node/no-extraneous-import": "off",
        "node/no-unsupported-features/es-syntax": "off",
        "node/no-unsupported-features/node-builtins": "off",
        "node/no-unpublished-import": "off",
        "node/no-missing-import": "off",
        "node/file-extension-in-import": [
            "off",
            "always",
            {
                tryExtensions: [".js", ".ts", ".node"],
            },
        ],
        // "@typescript-eslint/no-unused-vars": [
        //     "error",
        //     { vars: "all", args: "after-used", ignoreRestSiblings: false },
        // ],
        "@typescript-eslint/no-unused-vars": ["off"],
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "react-refresh/only-export-components": [
            "warn",
            { allowConstantExport: true },
        ],
    },
    settings: {
        "import/parsers": {
            "@typescript-eslint/parser": [".ts"],
        },
        "import/resolver": {},
        "import/extensions": [".js", ".mjs", ".ts"],
    },
    overrides: [],
    ignorePatterns: [
        "**/lib",
        "**/dist",
        "**/public",
        "**/storybook-static",
        "**/cache",
    ],
};
