module.exports = {
    root: true,
    extends: ["@owlprotocol/eslint-config/react"],
    //TODO: Disable some rules for now to keep unused boilerplate code
    rules: {
        "import/extensions": ["off", "ignorePackages", { json: "always" }],
        "import/no-default-export": ["off"],
        "@typescript-eslint/no-unused-vars": ["off"],
    },
};
