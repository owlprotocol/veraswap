import { arbitrumSepolia as arbitrumSepoliaChain } from "wagmi/chains";

export const arbitrumSepolia = {
    ...arbitrumSepoliaChain,
    rpcUrls: {
        default: {
            http: [
                "https://lb.drpc.org/ogrpc?network=arbitrum-sepolia&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB",
            ],
            webSocket: [
                "wss://lb.drpc.org/ogws?network=arbitrum-sepolia&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB",
            ],
        },
    },
};
