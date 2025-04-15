import { baseSepolia as baseSepoliaChain } from "wagmi/chains";

export const baseSepolia = {
    ...baseSepoliaChain,
    rpcUrls: {
        default: {
            http: ["https://lb.drpc.org/ogrpc?network=base-sepolia&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB"],
            webSocket: [
                "wss://lb.drpc.org/ogws?network=base-sepolia&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB",
            ],
        },
    },
};
