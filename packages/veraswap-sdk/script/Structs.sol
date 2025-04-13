// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

struct DeployParams {
    UniswapContracts uniswap;
    HyperlaneDeployParams hyperlane;
}

struct HyperlaneDeployParams {
    address mailbox;
}

struct UniswapContracts {
    address permit2;
    address weth9;
    address v2Factory;
    address v3Factory;
    bytes32 pairInitCodeHash;
    bytes32 poolInitCodeHash;
    address v4PoolManager;
    address v3NFTPositionManager;
    address v4PositionManager;
    address v4StateView;
    address v4Quoter;
    address universalRouter;
}

struct HyperlaneContracts {
    address mailbox;
    address testRecipient;
    address hypTokenRouterSweep;
}

struct CoreContracts {
    // Uniswap
    UniswapContracts uniswap;
    // Hyperlane
    HyperlaneContracts hyperlane;
    // Kernel
    address kernel;
    address kernelFactory;
    address ecdsaValidator;
    address ownableSignatureExecutor;
    address erc7579ExecutorRouter;
    address execute;
}
