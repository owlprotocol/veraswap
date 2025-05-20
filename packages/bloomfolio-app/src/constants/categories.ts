import { TokenCategory } from "./tokens.js";

export const CATEGORY_LABELS: Record<TokenCategory, string> = {
    native: "Native Tokens",
    stable: "Stablecoins",
    alt: "Alt Tokens",
    commodity: "Commodities",
    basket: "Baskets",
};

export const CATEGORY_ICONS: Record<TokenCategory, string> = {
    native: "🌐",
    stable: "💵",
    alt: "🚀",
    commodity: "🪙",
    basket: "🌸",
};
