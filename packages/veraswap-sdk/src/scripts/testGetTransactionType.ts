import { VeraSwapToken } from "../types/VeraSwapToken.js";
import { getTransactionType } from "../utils/getTransactionType.js";

const TOKEN_1: VeraSwapToken = {
    chainId: 1,
    name: "Wrapped BTC",
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    symbol: "WBTC",
    decimals: 18,
};

const TOKEN_2: VeraSwapToken = {
    chainId: 1,
    name: "Form",
    address: "0xEa35E107fB64Ff8C3c8c37DB2d23A7179f31D8EC",
    symbol: "FORM",
    decimals: 18,
    standard: "EvmHypCollateral",
    collateralAddress: "0xE7deE4823EE18F1347F1Cf7997f70B94eFDe2E1F",
    connections: [
        {
            vm: "ethereum",
            chainId: 478,
            address: "0x688da80Dfe2916c0a0Aa360323E52Aa5881AdB78",
        },
    ],
};

const TOKEN_3: VeraSwapToken = {
    chainId: 478,
    name: "Form",
    address: "0x688da80Dfe2916c0a0Aa360323E52Aa5881AdB78",
    symbol: "FORM",
    decimals: 18,
    standard: "EvmHypSynthetic",
    connections: [
        {
            vm: "ethereum",
            chainId: 1,
            address: "0xEa35E107fB64Ff8C3c8c37DB2d23A7179f31D8EC",
        },
    ],
};

const scenarios: {
    tokenIn: VeraSwapToken;
    tokenOut: VeraSwapToken;
    label: string;
}[] = [
    {
        tokenIn: TOKEN_1,
        tokenOut: TOKEN_2,
        label: "TOKEN_1 → TOKEN_2 (SWAP)",
    },
    {
        tokenIn: TOKEN_1,
        tokenOut: TOKEN_3,
        label: "TOKEN_1 → TOKEN_3 (SWAP_AND_BRIDGE)",
    },
    {
        tokenIn: TOKEN_2,
        tokenOut: TOKEN_1,
        label: "TOKEN_2 → TOKEN_1 (SWAP)",
    },
    {
        tokenIn: TOKEN_2,
        tokenOut: TOKEN_3,
        label: "TOKEN_2 → TOKEN_3 (BRIDGE)",
    },
    {
        tokenIn: TOKEN_3,
        tokenOut: TOKEN_1,
        label: "TOKEN_3 → TOKEN_1 (BRIDGE_AND_SWAP)",
    },
    {
        tokenIn: TOKEN_3,
        tokenOut: TOKEN_2,
        label: "TOKEN_3 → TOKEN_2 (BRIDGE)",
    },
];

function main() {
    for (const { tokenIn, tokenOut, label } of scenarios) {
        const result = getTransactionType({ tokenIn, tokenOut });
        console.log(`${label}`);
        console.dir(result);
        console.log();
    }

    console.log("Test complete");
}

main();
