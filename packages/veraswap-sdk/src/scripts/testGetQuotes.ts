import { VeraSwapToken } from "../types/VeraSwapToken.js";
import { getQuotes } from "../utils/getQuotes.js";

// const TEST_TOKEN_1: VeraSwapToken = {
//     chainId: 478,
//     name: "Form",
//     address: "0x688da80Dfe2916c0a0Aa360323E52Aa5881AdB78",
//     symbol: "FORM",
//     decimals: 18,
//     standard: "EvmHypSynthetic" as const,
// };

const TEST_TOKEN_2: VeraSwapToken = {
    chainId: 1,
    name: "Wrapped ETH",
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    symbol: "ETH",
    decimals: 18,
};

const TEST_TOKEN_3: VeraSwapToken = {
    chainId: 1,
    name: "Dogelon",
    address: "0x761D38e5ddf6ccf6Cf7c55759d5210750B5D60F3",
    symbol: "ELON",
    decimals: 18,
};

const AMOUNT = "1000000000000000000000000000";
const ACCOUNT = "0x1e830ED61b6f1bB785481dE18B06283D0736B955";
const UNISWAP_API_KEY = process.env.UNISWAP_API_KEY ?? "JoyCGj29tT4pymvhaGciK4r1aIPvqW6W53xT1fwo";

async function main() {
    try {
        console.log("Fetching token list");
        const response = await fetch(
            "https://raw.githubusercontent.com/owlprotocol/veraswap-tokens/main/bridged-tokens.json",
        );
        const allTokens: VeraSwapToken[] = await response.json();

        console.log("Running get quotes");

        console.time("Get Quotes");

        const { bestDirectSwap, bestTokenInToUSDC, bestUSDCToTokenOut } = await getQuotes({
            tokenIn: TEST_TOKEN_3,
            tokenOut: TEST_TOKEN_2,
            allTokens,
            amount: AMOUNT,
            account: ACCOUNT,
            uniswapApiKey: UNISWAP_API_KEY,
        });

        console.timeEnd("Get Quotes");

        console.log("Direct Swap:", bestDirectSwap);
        console.log("TokenIn → USDC:", bestTokenInToUSDC);
        console.log("USDC → TokenOut:", bestUSDCToTokenOut);

        console.log("Quote process completed.");
    } catch (error) {
        console.error("Error:", error);
    }
}

main();
