import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";
import invariant from "tiny-invariant";
import { Address, encodeDeployData, zeroAddress, zeroHash } from "viem";
import {
    base,
    bitlayer,
    bsc,
    celo,
    fraxtal,
    linea,
    lisk,
    mainnet,
    mantle,
    metis,
    mode,
    optimism,
    polygon,
    ronin,
    worldchain,
} from "viem/chains";

import { MockERC20, MockSuperchainERC20 } from "../artifacts/index.js";
import { interopDevnet0, interopDevnet1, opChainA, opChainB, opChainL1, superseed } from "../chains/index.js";
import { getUniswapV4Address } from "../currency/currency.js";
import { Ether } from "../currency/ether.js";
import { MultichainToken } from "../currency/multichainToken.js";
import { Token } from "../currency/token.js";
import { createPoolKey, DEFAULT_POOL_PARAMS } from "../types/PoolKey.js";
import { nativeOnChain } from "../uniswap/index.js";

import { getHypERC20Address, getHypERC20CollateralAddress, LOCAL_HYPERLANE_CONTRACTS } from "./hyperlane.js";

export function getMockERC20Address({ name, symbol, decimals }: { name: string; symbol: string; decimals: number }) {
    return getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            bytecode: MockERC20.bytecode,
            abi: MockERC20.abi,
            args: [name, symbol, decimals],
        }),
        salt: zeroHash,
    });
}

export function getMockSuperchainERC20Address({
    name,
    symbol,
    decimals,
}: {
    name: string;
    symbol: string;
    decimals: number;
}) {
    return getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            bytecode: MockSuperchainERC20.bytecode,
            abi: MockSuperchainERC20.abi,
            args: [name, symbol, decimals],
        }),
        salt: zeroHash,
    });
}

/**
 * Generate the `connections` field in tokens by connecting them to each other
 * @param tokens
 * @returns
 */
export function connectTokens<T extends { chainId: number; address: Address } = { chainId: number; address: Address }>(
    tokens: T[],
) {
    return tokens.map((token) => {
        return {
            ...token,
            connections: tokens
                .filter((t) => t.chainId != token.chainId)
                .map((t) => {
                    return {
                        vm: "evm",
                        chainId: t.chainId,
                        address: t.address,
                    };
                }),
        };
    });
}

//Token Class
function createMockERC20Token(
    {
        chainId,
        name,
        symbol,
        displayName,
        displaySymbol,
        decimals,
        logoURI,
    }: {
        chainId: number;
        name: string;
        symbol: string;
        displayName?: string;
        displaySymbol?: string;
        decimals: number;
        logoURI?: string;
    },
    mailbox: Address,
): MultichainToken {
    const address = getMockERC20Address({ name, symbol, decimals });
    return MultichainToken.createERC20({
        chainId,
        address,
        name: displayName ?? name,
        symbol: displaySymbol ?? symbol,
        decimals: 18,
        hypERC20Collateral: getHypERC20CollateralAddress({
            erc20: address,
            mailbox: mailbox,
        }),
        logoURI,
    });
}

export function createMockERC20ConnectedTokens(
    {
        chainId,
        name,
        symbol,
        displayName,
        displaySymbol,
        decimals,
        logoURI,
    }: {
        chainId: number;
        name: string;
        symbol: string;
        displayName?: string;
        displaySymbol?: string;
        decimals: number;
        logoURI?: string;
    },
    mailboxByChain: Record<number, Address>,
    msgSender: Address = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
): MultichainToken[] {
    const mailbox = mailboxByChain[chainId];
    invariant(mailbox != undefined, `Mailbox not found for token chainId ${chainId}`);

    const token = createMockERC20Token(
        {
            chainId,
            name,
            symbol,
            displayName,
            displaySymbol,
            decimals,
            logoURI,
        },
        mailbox,
    );

    const connections = Object.entries(mailboxByChain)
        .filter(([chainId]) => chainId != `${token.chainId}`)
        .map(([chainId, mailbox]) => {
            return { chainId: parseInt(chainId), mailbox };
        });

    const remoteTokens = connections.map(({ chainId, mailbox }) => {
        const address = getHypERC20Address({
            decimals,
            mailbox,
            totalSupply: 0n,
            name,
            symbol,
            msgSender,
        });
        return MultichainToken.createHypERC20({
            chainId,
            address,
            name: displayName ?? name,
            symbol: displaySymbol ?? symbol,
            decimals,
            logoURI,
        });
    });

    const tokens = [token, ...remoteTokens];
    MultichainToken.connect(tokens);

    return tokens;
}

const localMailboxByChain = {
    [opChainL1.id]: LOCAL_HYPERLANE_CONTRACTS[opChainL1.id].mailbox,
    [opChainA.id]: LOCAL_HYPERLANE_CONTRACTS[opChainA.id].mailbox,
    [opChainB.id]: LOCAL_HYPERLANE_CONTRACTS[opChainB.id].mailbox,
};

export const localSupersimCurrencies = [
    ...(() => {
        const tokenCData = {
            name: "Superchain Charlie",
            symbol: "SCHRL",
            decimals: 18,
            logoURI: "https://s2.coinmarketcap.com/static/img/coins/128x128/28752.png",
        };

        const tokenCAddress = getMockSuperchainERC20Address({ name: "Token C", symbol: "C", decimals: 18 });
        const tokenCA = MultichainToken.createSuperERC20({
            chainId: opChainA.id,
            address: tokenCAddress,
            ...tokenCData,
        });
        const tokenCB = MultichainToken.createSuperERC20({
            chainId: opChainB.id,
            address: tokenCAddress,
            hypERC20Collateral: getHypERC20CollateralAddress({
                erc20: tokenCAddress,
                mailbox: localMailboxByChain[opChainB.id],
            }),
            ...tokenCData,
        });
        const tokenCL1 = MultichainToken.createHypERC20({
            address: getHypERC20Address({
                decimals: 18,
                mailbox: localMailboxByChain[opChainL1.id],
                totalSupply: 0n,
                name: "Token C",
                symbol: "C",
                msgSender: zeroAddress,
            }),
            chainId: opChainL1.id,
            ...tokenCData,
        });
        MultichainToken.connect([tokenCA, tokenCB, tokenCL1]);
        return [tokenCA, tokenCB, tokenCL1];
    })(),
    ...(() => {
        const tokenDData = {
            name: "Superchain Demso",
            symbol: "SDEMS",
            decimals: 18,
            logoURI: "https://s2.coinmarketcap.com/static/img/coins/128x128/30126.png",
        };

        const tokenDAddress = getMockSuperchainERC20Address({ name: "Token D", symbol: "D", decimals: 18 });
        const tokenDA = MultichainToken.createSuperERC20({
            chainId: opChainA.id,
            address: tokenDAddress,
            hypERC20Collateral: getHypERC20CollateralAddress({
                erc20: tokenDAddress,
                mailbox: localMailboxByChain[opChainA.id],
            }),
            ...tokenDData,
        });
        const tokenDB = MultichainToken.createSuperERC20({
            chainId: opChainB.id,
            address: tokenDAddress,
            ...tokenDData,
        });
        const tokenDL1 = MultichainToken.createHypERC20({
            address: getHypERC20Address({
                decimals: 18,
                mailbox: localMailboxByChain[opChainL1.id],
                totalSupply: 0n,
                name: "Token D",
                symbol: "D",
                msgSender: zeroAddress,
            }),
            chainId: opChainL1.id,
            ...tokenDData,
        });
        MultichainToken.connect([tokenDA, tokenDB, tokenDL1]);
        return [tokenDA, tokenDB, tokenDL1];
    })(),
];

// WARNING: Changing the "address" name/symbol has impacts on Solidity, Tests, and other constants that assume "Token A" (test/constants)
// If you just want to change the "display" name/symbol, simply edit the one in the Token constructor
// Also see LocalTokens.sol for deployment of tokens
export const LOCAL_CURRENCIES: (Token | Ether | MultichainToken)[] = [
    ...createMockERC20ConnectedTokens(
        {
            chainId: opChainL1.id,
            name: "Token A",
            symbol: "A",
            displayName: "Alberto",
            decimals: 18,
            logoURI:
                "https://i0.wp.com/musically.com/wp-content/uploads/2024/11/Pedro-the-Raccoon.png?resize=1568%2C1176&ssl=1",
        },
        localMailboxByChain,
    ),
    ...createMockERC20ConnectedTokens(
        {
            chainId: opChainL1.id,
            name: "Token B",
            symbol: "B",
            displayName: "Berenice",
            decimals: 18,
            logoURI:
                "https://static.the-independent.com/2024/10/08/14/moodeng-crypto-price-prediction-memecoin.jpg?quality=75&width=1368&crop=3%3A2%2Csmart&auto=webp",
        },
        localMailboxByChain,
    ),
    new Token({
        chainId: opChainL1.id,
        address: getMockERC20Address({ name: "Liquid V34", symbol: "L34", decimals: 18 }),
        name: "Liquid V34",
        symbol: "L34",
        decimals: 18,
        logoURI: "https://assets.coingecko.com/coins/images/6319/large/usdc.png",
    }),
    new Token({
        chainId: opChainL1.id,
        address: getMockERC20Address({ name: "Liquid V3", symbol: "L3", decimals: 18 }),
        name: "Liquid V3",
        symbol: "L3",
        decimals: 18,
        logoURI: "https://assets.coingecko.com/coins/images/6319/large/usdc.png",
    }),
    new Token({
        chainId: opChainL1.id,
        address: getMockERC20Address({ name: "Liquid V4", symbol: "L4", decimals: 18 }),
        name: "Liquid V4",
        symbol: "L4",
        decimals: 18,
        logoURI: "https://assets.coingecko.com/coins/images/6319/large/usdc.png",
    }),
    ...createMockERC20ConnectedTokens(
        {
            chainId: opChainL1.id,
            name: "Token Z",
            symbol: "Z",
            displayName: "Zoe",
            decimals: 18,
            logoURI: "https://assets.kraken.com/marketing/web/icons-uni-webp/s_samo.webp",
        },
        localMailboxByChain,
    ),
    Ether.onChain(opChainL1.id),
    Ether.onChain(opChainA.id),
    Ether.onChain(opChainB.id),
    new Token({
        chainId: opChainL1.id,
        address: getMockERC20Address({ name: "Liquid V2", symbol: "L2", decimals: 18 }),
        name: "Liquid V2",
        symbol: "L2",
        decimals: 18,
        logoURI: "https://assets.coingecko.com/coins/images/6319/large/usdc.png",
    }),
];

// const testnetMailboxByChain: Record<number, Address> = {
//     [sepolia.id]: "0xfFAEF09B3cd11D9b20d1a19bECca54EEC2884766" as Address,
//     [optimismSepolia.id]: "0x6966b0E55883d49BFB24539356a2f8A673E02039" as Address,
//     [unichainSepolia.id]: "0xDDcFEcF17586D08A5740B7D91735fcCE3dfe3eeD" as Address,
// };

// function addMockERC20ConnectedTokens(
//     {
//         chainId,
//         name,
//         symbol,
//         decimals,
//         address,
//         hypAddresses,
//     }: {
//         chainId: number;
//         name: string;
//         symbol: string;
//         decimals: number;
//         address: Address;
//         hypAddresses: Record<number, Address>;
//     },
//     mailboxByChain: Record<number, Address>,
// ): MultichainToken[] {
//     const mailbox = mailboxByChain[chainId];
//
//     const token = MultichainToken.createERC20({
//         chainId,
//         address,
//         name,
//         symbol,
//         decimals,
//         hypERC20Collateral: getHypERC20CollateralAddress({
//             erc20: address,
//             mailbox,
//         }),
//     });
//
//     const connections = Object.entries(mailboxByChain)
//         .filter(([id]) => parseInt(id) !== token.chainId)
//         .map(([id, mailbox]) => ({ chainId: parseInt(id), mailbox }));
//
//     const remoteTokens = connections.map(({ chainId }) => {
//         const hypAddress = hypAddresses[chainId];
//
//         return MultichainToken.createHypERC20({
//             chainId,
//             address: hypAddress,
//             name,
//             symbol,
//             decimals,
//         });
//     });
//
//     const tokens = [token, ...remoteTokens];
//     MultichainToken.connect(tokens);
//
//     return tokens;
// }

export const TESTNET_CURRENCIES = [
    // ...addMockERC20ConnectedTokens(
    //     {
    //         chainId: sepolia.id,
    //         name: "Token C",
    //         symbol: "C",
    //         decimals: 18,
    //         address: "0x6b821901f606F2216436CACA965c3B89cB4f1240",
    //         hypAddresses: {
    //             [optimismSepolia.id]: "0x640C4647858C4FF1a9e72Ce0A2De1ef74641D954",
    //             [unichainSepolia.id]: "0x5cED2AC3066a17c0A2ed31F95DcDC9fd5C19DAbB",
    //         },
    //     },
    //     testnetMailboxByChain,
    // ),
    // ...addMockERC20ConnectedTokens(
    //     {
    //         chainId: sepolia.id,
    //         name: "Token D",
    //         symbol: "D",
    //         decimals: 18,
    //         address: "0x37c6E14d5BB318f211f71e92857794fD9Dd97Ee9",
    //         hypAddresses: {
    //             [optimismSepolia.id]: "0xE76f05585813d2736348F6AEeFbD94927813b4Cb",
    //             [unichainSepolia.id]: "0x82B7EF712a532F9Dd068cd1B3ddf3948c1BBE39D",
    //         },
    //     },
    //     testnetMailboxByChain,
    // ),
    ...(() => {
        const tokenCData = {
            name: "Superchain Charlie",
            symbol: "SCHRL",
            decimals: 18,
            logoURI: "https://s2.coinmarketcap.com/static/img/coins/128x128/28752.png",
        };

        const tokenCAddress = getMockSuperchainERC20Address({ name: "Token C", symbol: "C", decimals: 18 });
        const tokenC0 = MultichainToken.createSuperERC20({
            chainId: interopDevnet0.id,
            address: tokenCAddress,
            ...tokenCData,
        });
        const tokenC1 = MultichainToken.createSuperERC20({
            chainId: interopDevnet1.id,
            address: tokenCAddress,
            ...tokenCData,
        });
        MultichainToken.connect([tokenC0, tokenC1]);
        return [tokenC0, tokenC1];
    })(),
    ...(() => {
        const tokenDData = {
            name: "Superchain Demso",
            symbol: "SDEMS",
            decimals: 18,
            logoURI: "https://s2.coinmarketcap.com/static/img/coins/128x128/30126.png",
        };

        const tokenDAddress = getMockSuperchainERC20Address({ name: "Token D", symbol: "D", decimals: 18 });
        const tokenD0 = MultichainToken.createSuperERC20({
            chainId: interopDevnet0.id,
            address: tokenDAddress,
            ...tokenDData,
        });
        const tokenD1 = MultichainToken.createSuperERC20({
            chainId: interopDevnet1.id,
            address: tokenDAddress,
            ...tokenDData,
        });
        MultichainToken.connect([tokenD0, tokenD1]);
        return [tokenD0, tokenD1];
    })(),
];

// const tokenCBaseAddress = "0x6b821901f606F2216436CACA965c3B89cB4f1240";
// const tokenDBaseAddress = "0x37c6E14d5BB318f211f71e92857794fD9Dd97Ee9";

// const cbBTCBaseAddress = "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf";

// const cbBTCData = {
//     decimals: 8,
//     name: "Coinbase Wrapped BTC",
//     symbol: "cbBTC",
//     logoURI: "https://assets.coingecko.com/coins/images/40143/standard/cbbtc.webp",
// };

// const usdcBaseAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
// const usdcOptimismAddress = "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85";
// const usdcSuperseedAddress = "0xc316c8252b5f2176d0135ebb0999e99296998f2e";

const baseOUSDTAddress = "0x1217BfE6c773EEC6cc4A38b5Dc45B92292B6E189";
const baseOUSDTHypERC20Collateral = "0x4F0654395d621De4d1101c0F98C1Dba73ca0a61f";
const celoOUSDTAddress = "0x5e5F4d6B03db16E7f00dE7C9AFAA53b92C8d1D42";
const celoOUSDTHypERC20Collateral = "0xbBa1938ff861c77eA1687225B9C33554379Ef327";
const fraxtalOUSDTAddress = "0x1217BfE6c773EEC6cc4A38b5Dc45B92292B6E189";
const fraxtalOUSDTHypERC20Collateral = "0xa0bD9e96556E27e6FfF0cC0F77496390d9844E1e";
// const inkOUSDTAddress = "0x1217BfE6c773EEC6cc4A38b5Dc45B92292B6E189";
// const inkOUSDTHypERC20Collateral = "0x69158d1A7325Ca547aF66C3bA599F8111f7AB519";
const liskOUSDTAddress = "0x1217BfE6c773EEC6cc4A38b5Dc45B92292B6E189";
const liskOUSDTHypERC20Collateral = "0x910FF91a92c9141b8352Ad3e50cF13ef9F3169A1";
const modeOUSDTAddress = "0x1217BfE6c773EEC6cc4A38b5Dc45B92292B6E189";
const modeOUSDTHypERC20Collateral = "0x324d0b921C03b1e42eeFD198086A64beC3d736c2";
const optimismOUSDTAddress = "0x1217BfE6c773EEC6cc4A38b5Dc45B92292B6E189";
const optimismOUSDTHypERC20Collateral = "0x7bD2676c85cca9Fa2203ebA324fb8792fbd520b8";
// const soneiumOUSDTAddress = "0x1217BfE6c773EEC6cc4A38b5Dc45B92292B6E189";
// const soneiumOUSDTHypERC20Collateral = "0x2dC335bDF489f8e978477Ae53924324697e0f7BB";
const superseedOUSDTAddress = "0x1217BfE6c773EEC6cc4A38b5Dc45B92292B6E189";
const superseedOUSDTHypERC20Collateral = "0x5beADE696E12aBE2839FEfB41c7EE6DA1f074C55";
// const unichainOUSDTAddress = "0x1217BfE6c773EEC6cc4A38b5Dc45B92292B6E189";
// const unichainOUSDTHypERC20Collateral = "0x4A8149B1b9e0122941A69D01D23EaE6bD1441b4f";
const worldchainOUSDTAddress = "0x1217BfE6c773EEC6cc4A38b5Dc45B92292B6E189";
const worldchainOUSDTHypERC20Collateral = "0xAf6bEdBA6ab73f0a5941d429807C8B9c24Ea95F3";
const roninOUSDTAddress = "0x1217BfE6c773EEC6cc4A38b5Dc45B92292B6E189";
const roninOUSDTHypERC20Collateral = "0xffa403dD3ff592e42475f0B3f6F57fB0F02Be52d";
// const metalOUSDTAddress = "0x1217BfE6c773EEC6cc4A38b5Dc45B92292B6E189";
// const metalOUSDTHypERC20Collateral = "0x4FC916e83F59706Ba1Ccdd607be8cB64753Fe4f0";
const bitlayerOUSDTAddress = "0x1217BfE6c773EEC6cc4A38b5Dc45B92292B6E189";
const bitlayerOUSDTHypERC20Collateral = "0xC58eeC72352b04358b0b6979ba10462190f0d54C";
const metisOUSDTAddress = "0x1217BfE6c773EEC6cc4A38b5Dc45B92292B6E189";
const metisOUSDTHypERC20Collateral = "0x6267Dbfc38f7Af897536563c15f07B89634cb656";
const lineaOUSDTAddress = "0x1217BfE6c773EEC6cc4A38b5Dc45B92292B6E189";
const lineaOUSDTHypERC20Collateral = "0x9909F6C638f61CFcEc4464e5b746402F56ced8F0";
const mantleOUSDTAddress = "0x1217BfE6c773EEC6cc4A38b5Dc45B92292B6E189";
const mantleOUSDTHypERC20Collateral = "0x6E77A2991Ea996Af182b9a6Dc8C942fC6A106683";
// const sonicOUSDTAddress = "0x1217BfE6c773EEC6cc4A38b5Dc45B92292B6E189";
// const sonicOUSDTHypERC20Collateral = "0x3adf8f4219BdCcd4B727B9dD67E277C58799b57C";
const ethereumOUSDTAddress = "0x6D265C7dD8d76F25155F1a7687C693FDC1220D12";
const ethereumOUSDTHypERC20Collateral = "0x88AC0fC430130983c0DDEB4C22574056D8340Ca8";

const oUSDTData = {
    name: "OpenUSDT",
    symbol: "oUSDT",
    decimals: 6,
    logoURI: "https://assets.coingecko.com/coins/images/54815/large/ousdt.jpg",
};

export const MAINNET_CURRENCIES = [
    ...(() => {
        const tokenBase = MultichainToken.createERC20({
            ...oUSDTData,
            chainId: base.id,
            address: baseOUSDTAddress,
            hypERC20Collateral: baseOUSDTHypERC20Collateral,
        });

        const tokenCelo = MultichainToken.createERC20({
            ...oUSDTData,
            chainId: celo.id,
            address: celoOUSDTAddress,
            hypERC20Collateral: celoOUSDTHypERC20Collateral,
        });

        const tokenFraxtal = MultichainToken.createERC20({
            ...oUSDTData,
            chainId: fraxtal.id,
            address: fraxtalOUSDTAddress,
            hypERC20Collateral: fraxtalOUSDTHypERC20Collateral,
        });

        // const tokenInk = MultichainToken.createERC20({
        //     ...oUSDTData,
        //     chainId: ink.id,
        //     address: inkOUSDTAddress,
        //     hypERC20Collateral: inkOUSDTHypERC20Collateral,
        // });

        const tokenLisk = MultichainToken.createERC20({
            ...oUSDTData,
            chainId: lisk.id,
            address: liskOUSDTAddress,
            hypERC20Collateral: liskOUSDTHypERC20Collateral,
        });

        const tokenMode = MultichainToken.createERC20({
            ...oUSDTData,
            chainId: mode.id,
            address: modeOUSDTAddress,
            hypERC20Collateral: modeOUSDTHypERC20Collateral,
        });

        const tokenOptimism = MultichainToken.createERC20({
            ...oUSDTData,
            chainId: optimism.id,
            address: optimismOUSDTAddress,
            hypERC20Collateral: optimismOUSDTHypERC20Collateral,
        });

        // const tokenSoneium = MultichainToken.createERC20({
        //     ...oUSDTData,
        //     chainId: soneium.id,
        //     address: soneiumOUSDTAddress,
        //     hypERC20Collateral: soneiumOUSDTHypERC20Collateral,
        // });

        const tokenSuperseed = MultichainToken.createERC20({
            ...oUSDTData,
            chainId: superseed.id,
            address: superseedOUSDTAddress,
            hypERC20Collateral: superseedOUSDTHypERC20Collateral,
        });

        // const tokenUnichain = MultichainToken.createERC20({
        //     ...oUSDTData,
        //     chainId: unichain.id,
        //     address: unichainOUSDTAddress,
        //     hypERC20Collateral: unichainOUSDTHypERC20Collateral,
        // });

        const tokenWorldchain = MultichainToken.createERC20({
            ...oUSDTData,
            chainId: worldchain.id,
            address: worldchainOUSDTAddress,
            hypERC20Collateral: worldchainOUSDTHypERC20Collateral,
        });

        const tokenRonin = MultichainToken.createERC20({
            ...oUSDTData,
            chainId: ronin.id,
            address: roninOUSDTAddress,
            hypERC20Collateral: roninOUSDTHypERC20Collateral,
        });

        // const tokenMetal = MultichainToken.createERC20({
        //     ...oUSDTData,
        //     chainId: metal.id,
        //     address: metalOUSDTAddress,
        //     hypERC20Collateral: metalOUSDTHypERC20Collateral,
        // });

        const tokenBitlayer = MultichainToken.createERC20({
            ...oUSDTData,
            chainId: bitlayer.id,
            address: bitlayerOUSDTAddress,
            hypERC20Collateral: bitlayerOUSDTHypERC20Collateral,
        });

        const tokenMetis = MultichainToken.createERC20({
            ...oUSDTData,
            chainId: metis.id,
            address: metisOUSDTAddress,
            hypERC20Collateral: metisOUSDTHypERC20Collateral,
        });

        const tokenLinea = MultichainToken.createERC20({
            ...oUSDTData,
            chainId: linea.id,
            address: lineaOUSDTAddress,
            hypERC20Collateral: lineaOUSDTHypERC20Collateral,
        });

        const tokenMantle = MultichainToken.createERC20({
            ...oUSDTData,
            chainId: mantle.id,
            address: mantleOUSDTAddress,
            hypERC20Collateral: mantleOUSDTHypERC20Collateral,
        });

        // const tokenSonic = MultichainToken.createERC20({
        //     ...oUSDTData,
        //     chainId: sonic.id,
        //     address: sonicOUSDTAddress,
        //     hypERC20Collateral: sonicOUSDTHypERC20Collateral,
        // });

        const tokenEthereum = MultichainToken.createERC20({
            ...oUSDTData,
            chainId: mainnet.id,
            address: ethereumOUSDTAddress,
            hypERC20Collateral: ethereumOUSDTHypERC20Collateral,
        });

        const tokens = [
            tokenBase,
            tokenCelo,
            tokenFraxtal,
            // tokenInk,
            tokenLisk,
            tokenMode,
            tokenOptimism,
            // tokenSoneium,
            tokenSuperseed,
            // tokenUnichain,
            tokenWorldchain,
            tokenRonin,
            // tokenMetal,
            tokenBitlayer,
            tokenMetis,
            tokenLinea,
            tokenMantle,
            // tokenSonic,
            tokenEthereum,
        ];

        MultichainToken.connect(tokens);
        return tokens;
    })(),
    nativeOnChain(bsc.id),
    nativeOnChain(polygon.id),
    new Token({
        chainId: base.id,
        address: "0x4F9Fd6Be4a90f2620860d680c0d4d5Fb53d1A825",
        name: "aixbt by Virtuals",
        symbol: "AIXBT",
        decimals: 18,
        logoURI: "https://coin-images.coingecko.com/coins/images/51784/large/3.png?1731981138",
    }),
    // https://app.uniswap.org/explore/tokens/base/0x7a8a5012022bccbf3ea4b03cd2bb5583d915fb1a
    new Token({
        chainId: base.id,
        address: "0x7A8A5012022BCCBf3EA4b03cD2bb5583d915fb1A",
        name: "Chuck",
        symbol: "CHUCK",
        decimals: 18,
        logoURI: "https://coin-images.coingecko.com/coins/images/37468/large/1000030138.jpg?1714457112",
    }),
    new Token({
        chainId: base.id,
        address: "0x02537463e57a44f861Ee861Ba4F590C413f984a6",
        name: "Broak on Base",
        symbol: "BROAK",
        decimals: 18,
        logoURI: "https://coin-images.coingecko.com/coins/images/56016/large/Logo_for_Coin_Gecko.png?1748023295",
    }),
    new Token({
        chainId: base.id,
        address: "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b",
        name: "Virtual Protocol",
        symbol: "VIRTUAL",
        decimals: 18,
        logoURI: "https://coin-images.coingecko.com/coins/images/34057/large/LOGOMARK.png?1708356054",
    }),
];

export const LOCAL_POOLS = {
    [opChainL1.id]: [
        createPoolKey({
            currency0: getUniswapV4Address(LOCAL_CURRENCIES[0]),
            currency1: getUniswapV4Address(LOCAL_CURRENCIES[3]),
            ...DEFAULT_POOL_PARAMS.FEE_3000_TICK_60,
        }),
        createPoolKey({
            currency0: zeroAddress,
            currency1: getUniswapV4Address(LOCAL_CURRENCIES[0]),
            ...DEFAULT_POOL_PARAMS.FEE_3000_TICK_60,
        }),
    ],
    /*
    [opChainA.id]: [
        createPoolKey({
            currency0: zeroAddress,
            currency1: getUniswapV4Address(LOCAL_CURRENCIES[6]),
            fee: 3000,
            tickSpacing: 60,
            hooks: zeroAddress,
        }),
    ],
    [opChainB.id]: [
        createPoolKey({
            currency0: zeroAddress,
            currency1: getUniswapV4Address(LOCAL_CURRENCIES[9]),
            fee: 3000,
            tickSpacing: 60,
            hooks: zeroAddress,
        }),
    ],
    */
};

export const CURRENCIES = [...LOCAL_CURRENCIES, ...TESTNET_CURRENCIES, ...MAINNET_CURRENCIES];
