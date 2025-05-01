import { Address } from "viem";

import { Currency, Ether, MultichainToken, MultichainTokenData, Token, TokenStandard2 } from "../currency/index.js";
import { RegistryErcToken, RegistryToken } from "../types/index.js";

export function convertRegistryTokens(tokens: RegistryToken[]): Currency[] {
    const tokenMap = new Map<string, RegistryErcToken>();

    for (const t of tokens) {
        if ("address" in t) {
            tokenMap.set(`${t.chainId}:${t.address.toLowerCase()}`, t);
        }
    }

    const getRemoteTokenData = (remoteChainId: number, remoteAddress: string): [number, MultichainTokenData] | null => {
        const key = `${remoteChainId}:${remoteAddress.toLowerCase()}`;
        const remoteTokenDefinition = tokenMap.get(key);

        if (!remoteTokenDefinition) {
            console.warn(`Token ${remoteAddress} on chain ${remoteChainId} is missing definition`);
            return null;
        }

        const {
            decimals: remoteDecimals,
            symbol: remoteSymbol = "",
            name: remoteName = "",
            logoURI: remoteLogoURI = "",
            standard: remoteStandard,
            hypERC20Collateral: remoteHypCollateral,
        } = remoteTokenDefinition;

        const tokenData: MultichainTokenData = {
            chainId: remoteChainId,
            address: remoteAddress as Address,
            standard: remoteStandard as TokenStandard2,
            decimals: remoteDecimals,
            symbol: remoteSymbol,
            name: remoteName,
            logoURI: remoteLogoURI,
            hypERC20Collateral: remoteHypCollateral ?? null,
        };

        return [remoteChainId, tokenData];
    };

    return tokens.map((token): Currency => {
        const { standard, chainId, decimals, symbol = "", name = "", logoURI = "" } = token;

        if (standard === "Native") {
            return Ether.onChain(chainId);
        }

        const { address, hypERC20Collateral, remoteTokens } = token;

        const parsedRemoteTokens = remoteTokens?.length
            ? Object.fromEntries(
                  remoteTokens
                      .map(({ chainId: remoteChainId, address: remoteAddress }) =>
                          getRemoteTokenData(remoteChainId, remoteAddress),
                      )
                      .filter((entry): entry is [number, MultichainTokenData] => entry !== null),
              )
            : undefined;

        switch (standard) {
            case "SuperERC20":
                return MultichainToken.createSuperERC20({ chainId, address, name, logoURI, symbol, decimals });

            case "HypERC20":
                return MultichainToken.create({
                    chainId,
                    address,
                    name,
                    logoURI,
                    symbol,
                    decimals,
                    standard: "HypERC20",
                    hypERC20Collateral: null,
                    remoteTokens: parsedRemoteTokens,
                });

            case "ERC20":
                if (parsedRemoteTokens && Object.keys(parsedRemoteTokens).length > 0) {
                    return MultichainToken.create({
                        chainId,
                        address,
                        name,
                        logoURI,
                        symbol,
                        decimals,
                        standard: "ERC20",
                        hypERC20Collateral: hypERC20Collateral ?? null,
                        remoteTokens: parsedRemoteTokens,
                    });
                } else {
                    return new Token({ chainId, address, name, symbol, decimals });
                }

            default:
                throw new Error(`Unsupported token standard`);
        }
    });
}
