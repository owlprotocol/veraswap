import { HYPERLANE_CHAIN_MAP } from "./HyperlaneChainIdMap.js";
import { VeraSwapToken } from "../types/VeraSwapToken.js";

// TODO: refactor and improve logic

export async function getTokenRelations({ token, allTokens }: { token: VeraSwapToken; allTokens: VeraSwapToken[] }) {
    if (!token.standard) {
        return [token];
    }

    const relatedTokens: VeraSwapToken[] = [];

    const matchedTokens = allTokens.filter(
        (t) => t.address.toLowerCase() === token.address.toLowerCase() && t.chainId === token.chainId,
    );

    for (const token of matchedTokens) {
        if (!token.standard) continue;

        const baseToken: VeraSwapToken = {
            chainId: token.chainId,
            address: token.address,
            name: token.name,
            standard: token.standard as "EvmHypCollateral" | "EvmHypSynthetic",
            decimals: token.decimals,
            symbol: token.symbol,
        };

        if (token.standard === "EvmHypCollateral" && token.collateralAddress) {
            baseToken.collateralAddress = token.collateralAddress;
        }

        relatedTokens.push(baseToken);

        if (token.connections) {
            for (const connection of token.connections) {
                const { chain: chainName, address } = connection;

                const relatedChainId = Object.entries(HYPERLANE_CHAIN_MAP).find(([, name]) => name === chainName)?.[0];

                if (!relatedChainId) continue;

                const relatedToken = allTokens.find(
                    (t) => t.chainId === Number(relatedChainId) && t.address.toLowerCase() === address.toLowerCase(),
                );

                if (!relatedToken) continue;

                const tokenRelation: VeraSwapToken = {
                    chainId: Number(relatedChainId),
                    address,
                    name: relatedToken.name,
                    standard: relatedToken.standard as "EvmHypCollateral" | "EvmHypSynthetic",
                    decimals: relatedToken.decimals,
                    symbol: relatedToken.symbol,
                };

                if (relatedToken.standard === "EvmHypCollateral" && relatedToken.collateralAddress) {
                    tokenRelation.collateralAddress = relatedToken.collateralAddress;
                }

                relatedTokens.push(tokenRelation);
            }
        }
    }

    return relatedTokens;
}
