import { getTokenRelations } from "./getTokensRelations.js";
import { VeraSwapToken } from "../types/VeraSwapToken.js";

export async function findMatchingChainIds(
    token1: VeraSwapToken,
    token2: VeraSwapToken,
    allTokens: VeraSwapToken[],
): Promise<{ token1: VeraSwapToken; token2: VeraSwapToken }[]> {
    const token1Relations = await getTokenRelations({ token: token1, allTokens });
    const token2Relations = await getTokenRelations({ token: token2, allTokens });

    const token1Map = new Map(token1Relations.map((t) => [t.chainId, t]));
    const token2Map = new Map(token2Relations.map((t) => [t.chainId, t]));

    const matchingResults = [];

    for (const chainId of token1Map.keys()) {
        if (token2Map.has(chainId)) {
            matchingResults.push({
                token1: token1Map.get(chainId)!,
                token2: token2Map.get(chainId)!,
            });
        }
    }

    return matchingResults;
}
