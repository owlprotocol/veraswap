import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";
import invariant from "tiny-invariant";
import { Address, encodeDeployData, zeroAddress, zeroHash } from "viem";
import {
    arbitrum,
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
    optimismSepolia,
    ronin,
    sepolia,
    worldchain,
} from "viem/chains";

import { MockERC20, MockSuperchainERC20 } from "../artifacts/index.js";
import { opChainA, opChainB, opChainL1, superseed, unichainSepolia } from "../chains/index.js";
import { getUniswapV4Address } from "../currency/currency.js";
import { Ether } from "../currency/ether.js";
import { MultichainToken } from "../currency/multichainToken.js";
import { createPoolKey, DEFAULT_POOL_PARAMS } from "../types/PoolKey.js";
import {
    BTC_BSC,
    CELO_CELO,
    nativeOnChain,
    opData,
    optimismOPAddress,
    UNI,
    USDC_AVALANCHE,
    USDC_BSC,
    USDC_CELO,
    USDC_POLYGON,
    USDC_ZORA,
    USDT_AVALANCHE,
    USDT_OPTIMISM,
    USDT_POLYGON,
    WBTC_ARBITRUM_ONE,
    WBTC_POLYGON,
} from "../uniswap/index.js";

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
        decimals,
    }: {
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
    },
    mailbox: Address,
): MultichainToken {
    const address = getMockERC20Address({ name, symbol, decimals });
    return MultichainToken.createERC20({
        chainId,
        address,
        name,
        symbol,
        decimals: 18,
        hypERC20Collateral: getHypERC20CollateralAddress({
            erc20: address,
            mailbox: mailbox,
        }),
    });
}

export function createMockERC20ConnectedTokens(
    {
        chainId,
        name,
        symbol,
        decimals,
    }: {
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
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
            decimals,
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
            name,
            symbol,
            decimals,
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

export const LOCAL_CURRENCIES = [
    ...createMockERC20ConnectedTokens(
        {
            chainId: opChainL1.id,
            name: "Token A",
            symbol: "A",
            decimals: 18,
        },
        localMailboxByChain,
    ),
    ...createMockERC20ConnectedTokens(
        {
            chainId: opChainL1.id,
            name: "Token B",
            symbol: "B",
            decimals: 18,
        },
        localMailboxByChain,
    ),
    /*
    // Commented out Super Tokens, (Pools are also commented out below)
    ...(() => {
        const tokenCAddress = getMockSuperchainERC20Address({ name: "Token C", symbol: "C", decimals: 18 });
        const tokenCA = MultichainToken.createSuperERC20({
            chainId: opChainA.id,
            address: tokenCAddress,
            name: "Token C",
            symbol: "C",
            decimals: 18,
        });
        const tokenCB = MultichainToken.createHypERC20({
            chainId: opChainB.id,
            address: getHypERC20CollateralAddress({
                erc20: tokenCAddress,
                mailbox: localMailboxByChain[opChainB.id],
            }),
            name: "Token C",
            symbol: "C",
            decimals: 18,
        });
        MultichainToken.connect([tokenCA, tokenCB]);
        return [tokenCA, tokenCB];
    })(),
    ...(() => {
        const tokenDAddress = getMockSuperchainERC20Address({ name: "Token D", symbol: "D", decimals: 18 });
        const tokenDA = MultichainToken.createHypERC20({
            chainId: opChainA.id,
            address: getHypERC20CollateralAddress({
                erc20: tokenDAddress,
                mailbox: localMailboxByChain[opChainA.id],
            }),
            name: "Token D",
            symbol: "D",
            decimals: 18,
        });
        const tokenDB = MultichainToken.createSuperERC20({
            chainId: opChainB.id,
            address: tokenDAddress,
            name: "Token D",
            symbol: "D",
            decimals: 18,
        });
        MultichainToken.connect([tokenDA, tokenDB]);
        return [tokenDA, tokenDB];
    })(),
    */
    Ether.onChain(opChainL1.id),
    Ether.onChain(opChainA.id),
    Ether.onChain(opChainB.id),
];

const testnetMailboxByChain: Record<number, Address> = {
    [sepolia.id]: "0xfFAEF09B3cd11D9b20d1a19bECca54EEC2884766" as Address,
    [optimismSepolia.id]: "0x6966b0E55883d49BFB24539356a2f8A673E02039" as Address,
    [unichainSepolia.id]: "0xDDcFEcF17586D08A5740B7D91735fcCE3dfe3eeD" as Address,
};

function addMockERC20ConnectedTokens(
    {
        chainId,
        name,
        symbol,
        decimals,
        address,
        hypAddresses,
    }: {
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        address: Address;
        hypAddresses: Record<number, Address>;
    },
    mailboxByChain: Record<number, Address>,
): MultichainToken[] {
    const mailbox = mailboxByChain[chainId];

    const token = MultichainToken.createERC20({
        chainId,
        address,
        name,
        symbol,
        decimals,
        hypERC20Collateral: getHypERC20CollateralAddress({
            erc20: address,
            mailbox,
        }),
    });

    const connections = Object.entries(mailboxByChain)
        .filter(([id]) => parseInt(id) !== token.chainId)
        .map(([id, mailbox]) => ({ chainId: parseInt(id), mailbox }));

    const remoteTokens = connections.map(({ chainId }) => {
        const hypAddress = hypAddresses[chainId];

        return MultichainToken.createHypERC20({
            chainId,
            address: hypAddress,
            name,
            symbol,
            decimals,
        });
    });

    const tokens = [token, ...remoteTokens];
    MultichainToken.connect(tokens);

    return tokens;
}

export const TESTNET_CURRENCIES = [
    ...addMockERC20ConnectedTokens(
        {
            chainId: sepolia.id,
            name: "Token C",
            symbol: "C",
            decimals: 18,
            address: "0x6b821901f606F2216436CACA965c3B89cB4f1240",
            hypAddresses: {
                [optimismSepolia.id]: "0x640C4647858C4FF1a9e72Ce0A2De1ef74641D954",
                [unichainSepolia.id]: "0x5cED2AC3066a17c0A2ed31F95DcDC9fd5C19DAbB",
            },
        },
        testnetMailboxByChain,
    ),
    ...addMockERC20ConnectedTokens(
        {
            chainId: sepolia.id,
            name: "Token D",
            symbol: "D",
            decimals: 18,
            address: "0x37c6E14d5BB318f211f71e92857794fD9Dd97Ee9",
            hypAddresses: {
                [optimismSepolia.id]: "0xE76f05585813d2736348F6AEeFbD94927813b4Cb",
                [unichainSepolia.id]: "0x82B7EF712a532F9Dd068cd1B3ddf3948c1BBE39D",
            },
        },
        testnetMailboxByChain,
    ),
    /*
    ...(() => {
        const tokenC0 = MultichainToken.createSuperERC20({
            chainId: interopDevnet0.id,
            address: "0x2Eb2838feBfB326803fF33C4F54cd2d3561ce6Ed",
            name: "Token C",
            symbol: "C",
            decimals: 18,
        });
        const tokenC1 = MultichainToken.createHypERC20({
            chainId: interopDevnet1.id,
            address: "0x2Eb2838feBfB326803fF33C4F54cd2d3561ce6Ed",
            name: "Token C",
            symbol: "C",
            decimals: 18,
        });
        MultichainToken.connect([tokenC0, tokenC1]);
        return [tokenC0, tokenC1];
    })(),
    ...(() => {
        const tokenD0 = MultichainToken.createHypERC20({
            chainId: interopDevnet0.id,
            address: "0x432EE6707eA6A11dBF889fABc12F2d51c6fA79A6",
            name: "Token D",
            symbol: "D",
            decimals: 18,
        });
        const tokenD1 = MultichainToken.createSuperERC20({
            chainId: interopDevnet1.id,
            address: "0x432EE6707eA6A11dBF889fABc12F2d51c6fA79A6",
            name: "Token D",
            symbol: "D",
            decimals: 18,
        });
        MultichainToken.connect([tokenD0, tokenD1]);
        return [tokenD0, tokenD1];
    })(),
    */
    // Ether.onChain(sepolia.id),
    // Ether.onChain(optimismSepolia.id),
    // Ether.onChain(unichainSepolia.id),
    // Ether.onChain(interopDevnet0.id),
    // Ether.onChain(interopDevnet1.id),
];

const tokenCBaseAddress = "0x6b821901f606F2216436CACA965c3B89cB4f1240";
const tokenDBaseAddress = "0x37c6E14d5BB318f211f71e92857794fD9Dd97Ee9";

const cbBTCBaseAddress = "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf";

// const cbBTCData = {
//     decimals: 8,
//     name: "Coinbase Wrapped BTC",
//     symbol: "cbBTC",
//     logoURI: "https://assets.coingecko.com/coins/images/40143/standard/cbbtc.webp",
// };

const usdcBaseAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const usdcOptimismAddress = "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85";
// const usdcSuperseedAddress = "0xc316c8252b5f2176d0135ebb0999e99296998f2e";

const suprBaseAddress = "0x17906b1Cd88aA8EfaEfC5e82891B52a22219BD45";
const suprBaseHypERC20Collateral = "0x458BDDd0793fe4f70912535f172466a5473f2e77";
const suprEthereumAddress = "0x17906b1Cd88aA8EfaEfC5e82891B52a22219BD45";
const suprEthereumHypERC20Collateral = "0xbc808c98beA0a097346273A9Fd7a5B231fc2d889";
// TODO: add ink chain
// const suprInkAddress = "0x17906b1Cd88aA8EfaEfC5e82891B52a22219BD45";
// const suprInkHypERC20Collateral = "0x6cfDDfa3e0867A873675B80FDEBeB94e9262b5F0";
const suprOptimismAddress = "0x17906b1Cd88aA8EfaEfC5e82891B52a22219BD45";
const suprOptimismHypERC20Collateral = "0xae1E04F18D1323d8EaC7Ba5b2c683c95DC3baC97";
const suprSuperseedAddress = "0xEe64bC3f4A58D638D0845b24e2f51534d01b6549";
const suprSuperseedHypERC20Collateral = "0xA1863B4b02b7DCd7429F62C775816328D63020F4";

const suprData = {
    name: "Superseed",
    symbol: "SUPR",
    decimals: 18,
    logoURI:
        "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/refs/heads/main/deployments/warp_routes/SUPR/logo.svg",
};

const ezETHArbitrumAddress = "0x2416092f143378750bb29b79eD961ab195CcEea5";
const ezETHArbitrumHypERC20Collateral = "0xB26bBfC6d1F469C821Ea25099017862e7368F4E8";
const ezETHBaseAddress = "0x2416092f143378750bb29b79eD961ab195CcEea5";
const ezETHBaseHypERC20Collateral = "0x2552516453368e42705D791F674b312b8b87CD9e";
const ezETHBscAddress = "0x2416092f143378750bb29b79eD961ab195CcEea5";
const ezETHBscHypERC20Collateral = "0xE00C6185a5c19219F1FFeD213b4406a254968c26";
const ezETHEthereumAddress = "0xC8140dA31E6bCa19b287cC35531c2212763C2059";
const ezETHEthereumHypERC20Collateral = "0xC59336D8edDa9722B4f1Ec104007191Ec16f7087";
const ezETHLineaAddress = "0x2416092f143378750bb29b79eD961ab195CcEea5";
const ezETHLineaHypERC20Collateral = "0xC59336D8edDa9722B4f1Ec104007191Ec16f7087";
const ezETHOptimismAddress = "0x2416092f143378750bb29b79eD961ab195CcEea5";
const ezETHOptimismHypERC20Collateral = "0xacEB607CdF59EB8022Cc0699eEF3eCF246d149e2";
// TODO: add unichain
// const ezETHUnichainAddress = "0x2416092f143378750bb29b79eD961ab195CcEea5";
// const ezETHUnichainHypERC20Collateral = "0xFf0247f72b0d7ceD319D8457dD30622a2bed78B5";

const ezETHData = {
    name: "Renzo Restaked ETH",
    symbol: "ezETH",
    decimals: 18,
    logoURI: "https://assets.coingecko.com/coins/images/34753/large/Ezeth_logo_circle.png",
};

const arbitrumHyperAddress = "0xC9d23ED2ADB0f551369946BD377f8644cE1ca5c4";
const baseHyperAddress = "0xC9d23ED2ADB0f551369946BD377f8644cE1ca5c4";
const bscHyperAddress = "0xC9d23ED2ADB0f551369946BD377f8644cE1ca5c4";
const ethereumHyperAddress = "0x93A2Db22B7c736B341C32Ff666307F4a9ED910F5";
const optimismHyperAddress = "0x9923DB8d7FBAcC2E69E87fAd19b886C81cd74979";

const hyperData = {
    name: "Hyperlane",
    symbol: "HYPER",
    decimals: 18,
    logoURI:
        "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/refs/heads/main/deployments/warp_routes/HYPER/logo.svg",
};

const optimismOPHypERC20Collateral = "0x0Ea3C23A4dC198c289D5443ac302335aBc86E6b1";
const superseedOPAddress = "0x4e128A1b613A9C9Ecf650FeE461c353612559fcf";

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
    // ...(() => {
    // const tokenBase = MultichainToken.create({
    //     ...cbBTCData,
    //     chainId: base.id,
    //     address: cbBTCBaseAddress,
    //     hypERC20Collateral: "0x66477F84bd21697c7781fc3992b3163463e3B224",
    //     standard: "ERC20",
    // });

    // const tokenMainnet = MultichainToken.create({
    //     ...cbBTCData,
    //     chainId: mainnet.id,
    //     standard: "ERC20",
    //     address: "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
    //     hypERC20Collateral: "0x7710d2FC9A2E0452b28a2cBf550429b579347199",
    // });

    // const tokenSuperseed = MultichainToken.create({
    //     ...cbBTCData,
    //     chainId: superseed.id,
    //     standard: "ERC20",
    //     address: "0x6f36dbd829de9b7e077db8a35b480d4329ceb331",
    //     hypERC20Collateral: "0x0a78BC3CBBC79C4C6E5d4e5b2bbD042E58e93484",
    // });

    // NOTE: base and mainnet are not connected
    //     MultichainToken.connect([tokenBase, tokenSuperseed]);
    //     MultichainToken.connect([tokenMainnet, tokenSuperseed]);
    //     return [tokenBase, tokenMainnet, tokenSuperseed];
    // })(),
    ...(() => {
        const tokenArbitrum = MultichainToken.createHypERC20({
            ...hyperData,
            chainId: arbitrum.id,
            address: arbitrumHyperAddress,
        });

        const tokenBase = MultichainToken.createHypERC20({
            ...hyperData,
            chainId: base.id,
            address: baseHyperAddress,
        });

        const tokenBSC = MultichainToken.createHypERC20({
            ...hyperData,
            chainId: bsc.id,
            address: bscHyperAddress,
        });

        const tokenEthereum = MultichainToken.createHypERC20({
            ...hyperData,
            chainId: mainnet.id,
            address: ethereumHyperAddress,
        });

        const tokenOptimism = MultichainToken.createHypERC20({
            ...hyperData,
            chainId: optimism.id,
            address: optimismHyperAddress,
        });

        const tokens = [tokenArbitrum, tokenBase, tokenBSC, tokenEthereum, tokenOptimism];

        MultichainToken.connect(tokens);
        return tokens;
    })(),
    // ...(() => {
    //     const tokenSuperseed = MultichainToken.create({
    //         ...usdcData,
    //         chainId: superseed.id,
    //         standard: "ERC20",
    //         address: usdcSuperseedAddress,
    //         hypERC20Collateral: "0xa7D6042eEf06E81168e640b5C41632eE5295227D",
    //     });

    //     const tokenBase = MultichainToken.create({
    //         ...usdcData,
    //         chainId: base.id,
    //         standard: "ERC20",
    //         address: usdcBaseAddress,
    //         hypERC20Collateral: "0x955132016f9B6376B1392aA7BFF50538d21Ababc",
    //     });

    //     const tokenOptimism = MultichainToken.create({
    //         ...usdcData,
    //         chainId: optimism.id,
    //         standard: "ERC20",
    //         address: usdcOptimismAddress,
    //         hypERC20Collateral: "0x741B077c69FA219CEdb11364706a3880A792423e",
    //     });

    //     MultichainToken.connect([tokenSuperseed, tokenBase]);
    //     MultichainToken.connect([tokenSuperseed, tokenOptimism]);

    //     return [tokenSuperseed, tokenBase, tokenOptimism];
    // })(),
    ...(() => {
        const tokenBase = MultichainToken.create({
            ...suprData,
            chainId: base.id,
            standard: "ERC20",
            address: suprBaseAddress,
            hypERC20Collateral: suprBaseHypERC20Collateral,
        });

        const tokenEthereum = MultichainToken.create({
            ...suprData,
            chainId: mainnet.id,
            standard: "ERC20",
            address: suprEthereumAddress,
            hypERC20Collateral: suprEthereumHypERC20Collateral,
        });

        // TODO: add ink chain
        // const tokenInk = MultichainToken.create({
        //     ...suprData,
        //     chainId: ink.id,
        //     standard: "ERC20",
        //     address: suprInkAddress,
        //     hypERC20Collateral: suprInkHypERC20Collateral,
        // });

        const tokenOptimism = MultichainToken.create({
            ...suprData,
            chainId: optimism.id,
            standard: "ERC20",
            address: suprOptimismAddress,
            hypERC20Collateral: suprOptimismHypERC20Collateral,
        });

        const tokenSuperseed = MultichainToken.create({
            ...suprData,
            chainId: superseed.id,
            standard: "ERC20",
            address: suprSuperseedAddress,
            hypERC20Collateral: suprSuperseedHypERC20Collateral,
        });

        // const tokens = [tokenBase, tokenEthereum, tokenInk, tokenOptimism, tokenSuperseed];
        const tokens = [tokenBase, tokenEthereum, tokenOptimism, tokenSuperseed];
        MultichainToken.connect(tokens);

        return tokens;
    })(),
    ...(() => {
        const tokenArbitrum = MultichainToken.create({
            ...ezETHData,
            chainId: arbitrum.id,
            standard: "ERC20",
            address: ezETHArbitrumAddress,
            hypERC20Collateral: ezETHArbitrumHypERC20Collateral,
        });

        const tokenBase = MultichainToken.create({
            ...ezETHData,
            chainId: base.id,
            standard: "ERC20",
            address: ezETHBaseAddress,
            hypERC20Collateral: ezETHBaseHypERC20Collateral,
        });

        const tokenBsc = MultichainToken.create({
            ...ezETHData,
            chainId: bsc.id,
            standard: "ERC20",
            address: ezETHBscAddress,
            hypERC20Collateral: ezETHBscHypERC20Collateral,
        });

        const tokenEthereum = MultichainToken.create({
            ...ezETHData,
            chainId: mainnet.id,
            standard: "ERC20",
            address: ezETHEthereumAddress,
            hypERC20Collateral: ezETHEthereumHypERC20Collateral,
        });

        const tokenLinea = MultichainToken.create({
            ...ezETHData,
            chainId: linea.id,
            standard: "ERC20",
            address: ezETHLineaAddress,
            hypERC20Collateral: ezETHLineaHypERC20Collateral,
        });

        const tokenOptimism = MultichainToken.create({
            ...ezETHData,
            chainId: optimism.id,
            standard: "ERC20",
            address: ezETHOptimismAddress,
            hypERC20Collateral: ezETHOptimismHypERC20Collateral,
        });

        // TODO: add unichain
        // const tokenUnichain = MultichainToken.create({
        //     ...ezETHData,
        //     chainId: unichain.id,
        //     standard: "ERC20",
        //     address: ezETHUnichainAddress,
        //     hypERC20Collateral: ezETHUnichainHypERC20Collateral,
        // });

        // const tokens = [tokenArbitrum, tokenBase, tokenBsc, tokenEthereum, tokenLinea, tokenOptimism, tokenUnichain];
        const tokens = [tokenArbitrum, tokenBase, tokenBsc, tokenEthereum, tokenLinea, tokenOptimism];
        MultichainToken.connect(tokens);

        return tokens;
    })(),
    ...(() => {
        const tokenOptimism = MultichainToken.create({
            ...opData,
            chainId: optimism.id,
            standard: "ERC20",
            address: optimismOPAddress,
            hypERC20Collateral: optimismOPHypERC20Collateral,
        });

        const tokenSuperseed = MultichainToken.createHypERC20({
            ...opData,
            chainId: superseed.id,
            address: superseedOPAddress,
        });

        const tokens = [tokenOptimism, tokenSuperseed];
        MultichainToken.connect(tokens);

        return tokens;
    })(),
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
    Ether.onChain(arbitrum.id),
    Ether.onChain(base.id),
    Ether.onChain(linea.id),
    Ether.onChain(optimism.id),
    Ether.onChain(superseed.id),
    Ether.onChain(mainnet.id),
    nativeOnChain(bsc.id),
    USDC_BSC,
    USDC_POLYGON,
    USDC_CELO,
    USDC_AVALANCHE,
    USDC_ZORA,
    USDT_OPTIMISM,
    USDT_POLYGON,
    USDT_AVALANCHE,
    WBTC_ARBITRUM_ONE,
    WBTC_POLYGON,
    CELO_CELO,
    // ...(() => {
    //     const tokenBase = MultichainToken.create({
    //         ...cbBTCData,
    //         chainId: base.id,
    //         address: cbBTCBaseAddress,
    //         hypERC20Collateral: "0x66477F84bd21697c7781fc3992b3163463e3B224",
    //         standard: "ERC20",
    //     });
    //     const tokenMainnet = MultichainToken.create({
    //         ...cbBTCData,
    //         chainId: mainnet.id,
    //         standard: "ERC20",
    //         address: "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
    //         hypERC20Collateral: "0x7710d2FC9A2E0452b28a2cBf550429b579347199",
    //     });
    //     const tokenSuperseed = MultichainToken.create({
    //         ...cbBTCData,
    //         chainId: superseed.id,
    //         standard: "ERC20",
    //         address: "0x6f36dbd829de9b7e077db8a35b480d4329ceb331",
    //         hypERC20Collateral: "0x0a78BC3CBBC79C4C6E5d4e5b2bbD042E58e93484",
    //     });
    //     // NOTE: base and mainnet are not connected
    //     MultichainToken.connect([tokenBase, tokenSuperseed]);
    //     MultichainToken.connect([tokenMainnet, tokenSuperseed]);
    //     return [tokenBase, tokenMainnet, tokenSuperseed];
    // })(),
    // ...(() => {
    //     const tokenSuperseed = MultichainToken.create({
    //         ...usdcData,
    //         chainId: superseed.id,
    //         standard: "ERC20",
    //         address: usdcSuperseedAddress,
    //         hypERC20Collateral: "0xa7D6042eEf06E81168e640b5C41632eE5295227D",
    //     });
    //     const tokenBase = MultichainToken.create({
    //         ...usdcData,
    //         chainId: base.id,
    //         standard: "ERC20",
    //         address: usdcBaseAddress,
    //         hypERC20Collateral: "0x955132016f9B6376B1392aA7BFF50538d21Ababc",
    //     });
    //     const tokenOptimism = MultichainToken.create({
    //         ...usdcData,
    //         chainId: optimism.id,
    //         standard: "ERC20",
    //         address: usdcOptimismAddress,
    //         hypERC20Collateral: "0x741B077c69FA219CEdb11364706a3880A792423e",
    //     });
    //     MultichainToken.connect([tokenSuperseed, tokenBase]);
    //     MultichainToken.connect([tokenSuperseed, tokenOptimism]);
    //     return [tokenSuperseed, tokenBase, tokenOptimism];
    // })(),
    // Ether.onChain(optimism.id),
    // Ether.onChain(base.id),
    // Ether.onChain(superseed.id),
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

const TESTNET_POOLS = {
    [sepolia.id]: [
        createPoolKey({
            currency0: tokenCBaseAddress,
            currency1: tokenDBaseAddress,
            fee: 3000,
            tickSpacing: 60,
            hooks: zeroAddress,
        }),
    ],
    /*
    [interopDevnet0.id]: [
        createPoolKey({
            currency0: getUniswapV4Address(TESTNET_CURRENCIES[6]),
            currency1: getUniswapV4Address(TESTNET_CURRENCIES[9]),
            fee: 3000,
            tickSpacing: 60,
            hooks: zeroAddress,
        }),
    ],
    */
};

const MAINNET_POOLS = {
    [base.id]: [
        createPoolKey({
            currency0: getUniswapV4Address(Ether.onChain(base.id)),
            currency1: cbBTCBaseAddress,
            ...DEFAULT_POOL_PARAMS.FEE_3000_TICK_60,
        }),
        createPoolKey({
            currency0: getUniswapV4Address(Ether.onChain(base.id)),
            currency1: usdcBaseAddress,
            ...DEFAULT_POOL_PARAMS.FEE_500_TICK_10,
        }),
        createPoolKey({
            currency0: usdcBaseAddress,
            currency1: cbBTCBaseAddress,
            ...DEFAULT_POOL_PARAMS.FEE_3000_TICK_60,
        }),
    ],
    [optimism.id]: [
        createPoolKey({
            currency0: getUniswapV4Address(Ether.onChain(optimism.id)),
            currency1: usdcOptimismAddress,
            ...DEFAULT_POOL_PARAMS.FEE_500_TICK_10,
        }),
    ],
};

export const POOLS = { ...LOCAL_POOLS, ...TESTNET_POOLS, ...MAINNET_POOLS };
export const CURRENCIES = [...LOCAL_CURRENCIES, ...MAINNET_CURRENCIES];
