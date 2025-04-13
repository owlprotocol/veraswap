import { typecheckedConfigs } from "@veraswap/eslint-config"
import importPlugin from "eslint-plugin-import";

export default [
    ...typecheckedConfigs,
    importPlugin.flatConfigs.recommended,
    importPlugin.flatConfigs.typescript,
    {
        rules: {
            "import/extensions": ["warn", "ignorePackages", { json: "always" }],
            "import/no-named-as-default": "off",
            "import/no-commonjs": "error",
            "import/no-default-export": "warn",
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
            "import/order": [
                "warn",
                {
                    alphabetize: {
                        order: "asc",
                        caseInsensitive: true
                    },
                    named: true,
                    "newlines-between": "always",
                },
            ]
        }
    }
]
