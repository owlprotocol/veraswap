import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";
import { Address, encodeDeployData, zeroHash } from "viem";
import { MockERC20 } from "../artifacts/MockERC20.js";
import { opChainA, opChainL1 } from "./chains.js";
import { getHypERC20Address, getHypERC20CollateralAddress, getMailboxAddress } from "./hyperlane.js";

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

export interface HypToken {
    standard: "HypERC20" | "HypERC20Collateral";
    chainId: number;
    symbol: string;
    name: string;
    address: Address;
    decimals: number;
    logoURI?: string;
    collateralAddress?: Address; // Actual token address
    connections?: {
        vm: string;
        chainId: number;
        address: Address;
    }[];
    [key: string]: unknown;
}

/**
 * Create a MockERC20, HypERC20Collateral, HypERC20Synthetic
 */
export function createMockERC20WarpRoute({
    name,
    symbol,
    decimals,
    originChainId,
    connectionChainIds,
    msgSender,
}: {
    name: string;
    symbol: string;
    decimals: number;
    originChainId: number;
    connectionChainIds: number[];
    msgSender?: Address;
}): HypToken[] {
    const mockERC20 = getMockERC20Address({ name, symbol, decimals });

    const hypERC20CollateralAddress = getHypERC20CollateralAddress({
        erc20: mockERC20,
        mailbox: getMailboxAddress({ chainId: originChainId }),
    });
    const hypERC20Collateral: HypToken = {
        standard: "HypERC20Collateral",
        chainId: originChainId,
        symbol,
        name,
        address: hypERC20CollateralAddress,
        decimals,
        collateralAddress: mockERC20,
        connections: [],
    };

    const hypERC20s = connectionChainIds.map((chainId) => {
        const address = getHypERC20Address({
            decimals,
            mailbox: getMailboxAddress({ chainId }),
            totalSupply: 0n,
            name,
            symbol,
            msgSender: msgSender ?? "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        });
        return {
            standard: "HypERC20",
            chainId,
            symbol,
            name,
            address,
            decimals,
            connections: [],
        } as HypToken;
    });

    const tokens = [hypERC20Collateral, ...hypERC20s];
    tokens.forEach((token) => {
        token.connections = tokens
            .filter((t) => t.chainId != token.chainId)
            .map((t) => {
                return {
                    vm: "evm",
                    chainId: t.chainId,
                    address: t.address,
                };
            });
    });

    return tokens;
}

export const LOCAL_TOKENS: HypToken[] = [
    ...createMockERC20WarpRoute({
        name: "Token A",
        symbol: "A",
        decimals: 18,
        originChainId: opChainL1.id,
        connectionChainIds: [opChainA.id],
    }),
    ...createMockERC20WarpRoute({
        name: "Token B",
        symbol: "B",
        decimals: 18,
        originChainId: opChainL1.id,
        connectionChainIds: [opChainA.id],
    }),
];
