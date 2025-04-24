import { Token } from "../types/Token.js";

export const getTokenAddress = (token: Token) =>
    token.standard === "HypERC20Collateral" || token.standard === "HypSuperchainERC20Collateral"
        ? token.collateralAddress
        : token.address;
