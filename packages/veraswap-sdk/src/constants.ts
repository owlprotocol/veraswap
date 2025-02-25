import { zeroAddress } from "viem";

export const MAX_UINT_256 = 2n ** 256n - 1n;
export const MAX_UINT_160 = 2n ** 160n - 1n;
export const MAX_UINT_48 = 2 ** 48 - 1;
export const V4_SWAP = 0x10;

export const UNISWAP_CONTRACTS = {
    [1337]: {
        POOL_MANAGER: "0x2c63d2fbFe33b23C40d0e227881484Cf3E0f6a7d",
        POSITION_MANAGER: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
        UNIVERSAL_ROUTER: "0x66bF296645d8d15F72329167770D2DeC004a3007",
        QUOTER: "0xC58a1453cC52b1DFcD582209F0e84F05B6917a83",
        STATE_VIEW: "0x50e1BB055c88f65CCe4B9eD29efBA7f83777712F",
    },
    [1338]: {
        POOL_MANAGER: "0x2c63d2fbFe33b23C40d0e227881484Cf3E0f6a7d",
        POSITION_MANAGER: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
        UNIVERSAL_ROUTER: "0x66bF296645d8d15F72329167770D2DeC004a3007",
        QUOTER: "0xC58a1453cC52b1DFcD582209F0e84F05B6917a83",
        STATE_VIEW: "0x50e1BB055c88f65CCe4B9eD29efBA7f83777712F",
    },
} as const;

export const MOCK_TOKENS = {
    [1337]: {
        MOCK_A: "0xD7DFd22108945B5E0F1Eeb6F27D2b506680F959a",
        MOCK_B: "0x566aC69cF8FdFDD0e8755DA09a9Ef723fa120aF2",
    },
    [1338]: {
        MOCK_A: "0xD7DFd22108945B5E0F1Eeb6F27D2b506680F959a",
        MOCK_B: "0x566aC69cF8FdFDD0e8755DA09a9Ef723fa120aF2",
    },
} as const;

export const MOCK_POOLS = {
    [1337]: {
        currency0:
            MOCK_TOKENS[1337].MOCK_A < MOCK_TOKENS[1337].MOCK_B ? MOCK_TOKENS[1337].MOCK_A : MOCK_TOKENS[1337].MOCK_B,
        currency1:
            MOCK_TOKENS[1337].MOCK_A < MOCK_TOKENS[1337].MOCK_B ? MOCK_TOKENS[1337].MOCK_B : MOCK_TOKENS[1337].MOCK_A,
        fee: 3000,
        tickSpacing: 60,
        hooks: zeroAddress,
    },
    [1338]: {
        currency0:
            MOCK_TOKENS[1338].MOCK_A < MOCK_TOKENS[1338].MOCK_B ? MOCK_TOKENS[1338].MOCK_A : MOCK_TOKENS[1338].MOCK_B,
        currency1:
            MOCK_TOKENS[1338].MOCK_A < MOCK_TOKENS[1338].MOCK_B ? MOCK_TOKENS[1338].MOCK_B : MOCK_TOKENS[1338].MOCK_A,
        fee: 3000,
        tickSpacing: 60,
        hooks: zeroAddress,
    },
};
