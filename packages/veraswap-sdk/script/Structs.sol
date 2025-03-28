// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

struct HyperlaneDeployParams {
    address mailbox;
}

struct UniswapContracts {
    address v4PoolManager;
    address v4PositionManager;
    address v4StateView;
    address v4Quoter;
    address universalRouter;
}

struct HyperlaneContracts {
    address ism;
    address hook;
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
}
