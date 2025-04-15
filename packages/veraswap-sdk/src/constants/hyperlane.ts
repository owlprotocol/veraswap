import { ChainMap, ChainMetadata } from "@hyperlane-xyz/sdk";
import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";
import { Address, encodeAbiParameters, encodeDeployData, keccak256, zeroAddress, zeroHash } from "viem";

import { ERC7579ExecutorRouter } from "../artifacts/ERC7579ExecutorRouter.js";
import { HypERC20 } from "../artifacts/HypERC20.js";
import { HypERC20Collateral } from "../artifacts/HypERC20Collateral.js";
import { HypTokenRouterSweep } from "../artifacts/index.js";
import { Mailbox } from "../artifacts/Mailbox.js";
import { MockInterchainGasPaymaster } from "../artifacts/MockInterchainGasPaymaster.js";
import { NoopIsm } from "../artifacts/NoopIsm.js";
import { PausableHook } from "../artifacts/PausableHook.js";
import { opChainA, opChainB, opChainL1 } from "../chains/index.js";
import { HyperlaneRegistry } from "../types/HyperlaneRegistry.js";

import { LOCAL_KERNEL_CONTRACTS } from "./kernel.js";

export function getMailboxAddress({ chainId }: { chainId: number }) {
    return getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            bytecode: Mailbox.bytecode,
            abi: Mailbox.abi,
            args: [chainId],
        }),
        salt: zeroHash,
    });
}

export function getMockInterchainGasPaymasterAddress() {
    return getDeployDeterministicAddress({
        bytecode: MockInterchainGasPaymaster.bytecode,
        salt: zeroHash,
    });
}

export function getHyperlaneContracts({ chainId }: { chainId: number }) {
    const mailbox = getMailboxAddress({ chainId });

    const noopISM = getDeployDeterministicAddress({
        bytecode: NoopIsm.bytecode,
        salt: zeroHash,
    });

    const pausableHook = getDeployDeterministicAddress({
        bytecode: PausableHook.bytecode,
        salt: zeroHash,
    });

    const mockInterchainGasPaymaster = getMockInterchainGasPaymasterAddress();

    return {
        mailbox,
        noopISM,
        pausableHook,
        mockInterchainGasPaymaster,
    };
}

export function getHypERC7579RouterAddress({
    mailbox,
    ism,
    executor,
    factory,
}: {
    mailbox: Address;
    ism: Address;
    executor: Address;
    factory: Address;
}) {
    return getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            bytecode: ERC7579ExecutorRouter.bytecode,
            abi: ERC7579ExecutorRouter.abi,
            args: [mailbox, ism, executor, factory],
        }),
        salt: zeroHash,
    });
}

const hyperlaneCoreContracts = {
    [opChainL1.id]: getHyperlaneContracts({ chainId: opChainL1.id }),
    [opChainA.id]: getHyperlaneContracts({ chainId: opChainA.id }),
    [opChainB.id]: getHyperlaneContracts({ chainId: opChainB.id }),
};

export const LOCAL_HYPERLANE_CONTRACTS = {
    [opChainL1.id]: {
        ...hyperlaneCoreContracts[opChainL1.id],
        erc7579Router: getHypERC7579RouterAddress({
            mailbox: hyperlaneCoreContracts[opChainL1.id].mailbox,
            ism: zeroAddress,
            executor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
            factory: LOCAL_KERNEL_CONTRACTS.kernelFactory,
        }),
    },
    [opChainA.id]: {
        ...hyperlaneCoreContracts[opChainA.id],
        erc7579Router: getHypERC7579RouterAddress({
            mailbox: hyperlaneCoreContracts[opChainA.id].mailbox,
            ism: zeroAddress,
            executor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
            factory: LOCAL_KERNEL_CONTRACTS.kernelFactory,
        }),
    },
    [opChainB.id]: {
        ...hyperlaneCoreContracts[opChainB.id],
        erc7579Router: getHypERC7579RouterAddress({
            mailbox: hyperlaneCoreContracts[opChainB.id].mailbox,
            ism: zeroAddress,
            executor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
            factory: LOCAL_KERNEL_CONTRACTS.kernelFactory,
        }),
    },
};

/*** Hyperlane Tokens ***/

/***
 * Get HypERC20 Address as deployed by HypERC20Utils.sol
 */
export function getHypERC20Address({
    decimals,
    mailbox,
    totalSupply,
    name,
    symbol,
    msgSender,
}: {
    decimals: number;
    mailbox: Address;
    totalSupply: bigint;
    name: string;
    symbol: string;
    msgSender: Address;
}) {
    return getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            bytecode: HypERC20.bytecode,
            abi: HypERC20.abi,
            args: [decimals, mailbox],
        }),
        salt: keccak256(
            encodeAbiParameters(
                [{ type: "uint256" }, { type: "string" }, { type: "string" }, { type: "address" }],
                [totalSupply, name, symbol, msgSender],
            ),
        ),
    });
}

export function getHypERC20CollateralAddress({ erc20, mailbox }: { erc20: Address; mailbox: Address }) {
    return getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            bytecode: HypERC20Collateral.bytecode,
            abi: HypERC20Collateral.abi,
            args: [erc20, mailbox],
        }),
        salt: zeroHash,
    });
}

export const HYPERLANE_ROUTER_SWEEP_ADDRESS = getDeployDeterministicAddress({
    bytecode: HypTokenRouterSweep.bytecode,
    salt: zeroHash,
});

export const testHyperlaneRegistry: HyperlaneRegistry = {
    metadata: {
        "localhost-1337": {
            chainId: 1337,
            name: "localhost-1337",
        } as ChainMetadata,
        "localhost-1338": {
            chainId: 1338,
            name: "localhost-1338",
        } as ChainMetadata,
        "localhost-op": {
            chainId: 900,
            name: "localhost-op",
        } as ChainMetadata,
        "localhost-op-chain-a": {
            chainId: 901,
            name: "localhost-op-chain-a",
        } as ChainMetadata,
        "localhost-op-chain-b": {
            chainId: 902,
            name: "localhost-op-chain-b",
        } as ChainMetadata,
    } as ChainMap<ChainMetadata>,
    addresses: {
        "localhost-1337": {
            mailbox: getMailboxAddress({ chainId: 1337 }),
        },
        "localhost-1338": {
            mailbox: getMailboxAddress({ chainId: 1338 }),
        },
        "localhost-op": {
            mailbox: getMailboxAddress({ chainId: 900 }),
        },
        "localhost-op-chain-a": {
            mailbox: getMailboxAddress({ chainId: 901 }),
        },
        "localhost-op-chain-b": {
            mailbox: getMailboxAddress({ chainId: 902 }),
        },
    },
};
