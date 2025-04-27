import { Chain, ChainFormatters } from "viem";

export type ChainWithMetadata<formatters extends ChainFormatters | undefined = ChainFormatters | undefined> = Chain<
    formatters,
    { logoURI?: string }
>;
