import { optimismSepolia as optimismSepoliaChain } from "wagmi/chains";

export const optimismSepolia = {
    ...optimismSepoliaChain,
    rpcUrls: {
        default: {
            http: [
                "https://lb.drpc.org/ogrpc?network=optimism-sepolia&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB",
            ],
            webSocket: [
                "wss://lb.drpc.org/ogws?network=optimism-sepolia&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB",
            ],
        },
    },
};
