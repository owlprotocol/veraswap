// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

// Uniswap V3 Core
import {IUniswapV3Factory} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import {IUniswapV3Pool} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
// Uniswap V3 Periphery
import {V3PositionManagerMock} from "../../contracts/uniswap/v3/V3PositionManagerMock.sol";
// Uniswap V4 Core
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {IPositionManager} from "@uniswap/v4-periphery/src/interfaces/IPositionManager.sol";
// Liquidity Pools
import {PoolUtils} from "../utils/PoolUtils.sol";
// Contracts
import {UniswapContracts} from "../Structs.sol";
import {LocalTokens} from "./LocalTokens.sol";

/** Deploys Uniswap Pools for local environment such as tests and scripts */
// Tokens
// ETH, L34: Connected to A/B with V3/V4
// L3: Connected to A/B with V3, ETH/L34 with V4
// L4: Connected to A/B with V4, ETH/L34 with V3

// V3/V4 paths
// A/B -> liq34/ETH
// A -> liq34/ETH -> B

// V3-only paths
// A/B -> liq3
// A -> liq3 -> B

// V4-only paths
// A/B -> liq4
// A -> liq4 -> B

// Mixed route paths
// A/B -> liq4 -> liq34 (V4 -> V3)
// A/B -> liq3 -> liq34 (V3 -> V4)
// ETH -> liq3 -> A (V4 -> V3)
// ETH -> liq4 -> A (V3 -> V4)

struct LocalV4Pools {
    PoolKey eth_tokenA;
    PoolKey eth_tokenB;
    PoolKey eth_liq3;
    PoolKey liq34_tokenA;
    PoolKey liq34_tokenB;
    PoolKey liq34_liq3;
    PoolKey liq4_tokenA;
    PoolKey liq4_tokenB;
}

struct LocalV3Pools {
    IUniswapV3Pool weth_tokenA;
    IUniswapV3Pool weth_tokenB;
    IUniswapV3Pool weth_liq4;
    IUniswapV3Pool liq34_tokenA;
    IUniswapV3Pool liq34_tokenB;
    IUniswapV3Pool liq34_liq4;
    IUniswapV3Pool liq3_tokenA;
    IUniswapV3Pool liq3_tokenB;
}

library LocalPoolsLibrary {
    /**
     * Deploys local V4 pools for testing purposes. Assumes that contracts and tokens are all deployed
     * @param v4PositionManager Uniswap V4 position manager
     * @param tokens Local tokens
     */
    function deployV4Pools(
        IPositionManager v4PositionManager,
        LocalTokens memory tokens
    ) internal returns (LocalV4Pools memory pools) {
        Currency eth = Currency.wrap(address(0));
        Currency liq34 = Currency.wrap(address(tokens.liq34));
        Currency liq3 = Currency.wrap(address(tokens.liq3));
        Currency liq4 = Currency.wrap(address(tokens.liq4));
        Currency tokenA = Currency.wrap(address(tokens.tokenA));
        Currency tokenB = Currency.wrap(address(tokens.tokenB));

        // ETH
        pools.eth_tokenA = PoolUtils.createV4Pool(eth, tokenA, v4PositionManager, 10 ether);
        pools.eth_tokenB = PoolUtils.createV4Pool(eth, tokenB, v4PositionManager, 10 ether);
        pools.eth_liq3 = PoolUtils.createV4Pool(
            eth,
            liq3, //for mixed route test ETH -> liq3 -> A
            v4PositionManager,
            10 ether
        );
        // L34
        pools.liq34_tokenA = PoolUtils.createV4Pool(liq34, tokenA, v4PositionManager, 10 ether);
        pools.liq34_tokenB = PoolUtils.createV4Pool(liq34, tokenB, v4PositionManager, 10 ether);
        pools.liq34_liq3 = PoolUtils.createV4Pool(
            liq34,
            liq3, //for mixed route test A -> liq3 -> liq34
            v4PositionManager,
            10 ether
        );
        // L4
        pools.liq4_tokenA = PoolUtils.createV4Pool(liq4, tokenA, v4PositionManager, 10 ether);
        pools.liq4_tokenB = PoolUtils.createV4Pool(liq4, tokenB, v4PositionManager, 10 ether);
    }

    /**
     * Deploys local V3 pools for testing purposes. Assumes that contracts and tokens are all deployed
     * @param v3Factory Uniswap V3 factory
     * @param v3PositionManager Uniswap V3 position manager
     * @param tokens Local tokens
     */
    function deployV3Pools(
        IUniswapV3Factory v3Factory,
        V3PositionManagerMock v3PositionManager,
        LocalTokens memory tokens
    ) internal returns (LocalV3Pools memory pools) {
        Currency weth9 = Currency.wrap(address(tokens.weth9));
        Currency liq34 = Currency.wrap(address(tokens.liq34));
        Currency liq3 = Currency.wrap(address(tokens.liq3));
        Currency liq4 = Currency.wrap(address(tokens.liq4));
        Currency tokenA = Currency.wrap(address(tokens.tokenA));
        Currency tokenB = Currency.wrap(address(tokens.tokenB));

        // WETH
        pools.weth_tokenA = PoolUtils.createV3Pool(weth9, tokenA, v3Factory, v3PositionManager, 10 ether);
        pools.weth_tokenB = PoolUtils.createV3Pool(weth9, tokenB, v3Factory, v3PositionManager, 10 ether);
        pools.weth_liq4 = PoolUtils.createV3Pool(
            weth9,
            liq4, //for mixed route test ETH -> liq4 -> A
            v3Factory,
            v3PositionManager,
            10 ether
        );
        // L34
        pools.liq34_tokenA = PoolUtils.createV3Pool(liq34, tokenA, v3Factory, v3PositionManager, 10 ether);
        pools.liq34_tokenB = PoolUtils.createV3Pool(liq34, tokenB, v3Factory, v3PositionManager, 10 ether);
        pools.liq34_liq4 = PoolUtils.createV3Pool(
            liq34,
            liq4, //for mixed route test A -> liq4 -> liq34
            v3Factory,
            v3PositionManager,
            10 ether
        );
        // L3
        pools.liq3_tokenA = PoolUtils.createV3Pool(liq3, tokenA, v3Factory, v3PositionManager, 10 ether);
        pools.liq3_tokenB = PoolUtils.createV3Pool(liq3, tokenB, v3Factory, v3PositionManager, 10 ether);
    }
}
