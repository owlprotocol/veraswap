import { story as storyChain } from "wagmi/chains";

import { ChainWithMetadata } from "./chainWithMetadata.js";

export const story = {
    ...storyChain,
    // TODO: add custom rpc for story, preferably with WS.
    custom: {
        logoURI:
            "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/refs/heads/main/chains/story/logo.svg",
    },
} satisfies ChainWithMetadata;
