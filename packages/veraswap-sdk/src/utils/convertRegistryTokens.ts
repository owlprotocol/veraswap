import { Currency, Ether, MultichainToken, MultichainTokenData, Token, TokenStandard2 } from "../currency/index.js";
import { RegistryToken } from "../types/index.js";

export function convertRegistryTokens(tokens: RegistryToken[]): Currency[] {
    return tokens.map((token): Currency => {
        const { standard, chainId, decimals, symbol = "", name = "", logoURI = "" } = token;

        if (standard === "Native") {
            return Ether.onChain(chainId);
        }

        const { address, hypERC20Collateral, remoteTokens } = token;

        const parsedRemoteTokens: Record<number, MultichainTokenData> | undefined =
            remoteTokens && remoteTokens.length > 0
                ? Object.fromEntries(
                      remoteTokens.map((remote) => [
                          remote.chainId,
                          {
                              chainId: remote.chainId,
                              address: remote.address,
                              standard: remote.standard as TokenStandard2,
                              decimals,
                              symbol,
                              name,
                              logoURI,
                              hypERC20Collateral: remote.hypERC20Collateral ?? null,
                          },
                      ]),
                  )
                : undefined;

        switch (standard) {
            case "SuperERC20":
                return MultichainToken.createSuperERC20({
                    chainId,
                    address,
                    name,
                    logoURI,
                    symbol,
                    decimals,
                });

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
