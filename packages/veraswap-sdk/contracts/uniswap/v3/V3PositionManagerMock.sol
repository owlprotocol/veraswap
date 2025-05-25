// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Permit2
import {IAllowanceTransfer} from "permit2/src/interfaces/IAllowanceTransfer.sol";
// Uniswap V3 Core
import {IUniswapV3Pool} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import {IUniswapV3MintCallback} from "@uniswap/v3-core/contracts/interfaces/callback/IUniswapV3MintCallback.sol";
import {V3CallbackValidation} from "./V3CallbackValidation.sol";
import {V3PoolKey} from "./V3PoolKey.sol";
// Uniswap V4 Core
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";

/// @title V3PositionManagerMock
/// @notice A simple position manager for Uniswap V3 designed for testing
contract V3PositionManagerMock is IUniswapV3MintCallback {
    address constant PERMIT2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;

    address public immutable factory;
    bytes32 public immutable poolInitCodeHash;

    struct MintCallbackData {
        V3PoolKey poolKey;
        address payer;
    }

    constructor(address _factory, bytes32 _poolInitCodeHash) {
        factory = _factory;
        poolInitCodeHash = _poolInitCodeHash;
    }

    /// @inheritdoc IUniswapV3MintCallback
    function uniswapV3MintCallback(uint256 amount0Owed, uint256 amount1Owed, bytes calldata data) external override {
        // Callback validation
        MintCallbackData memory decoded = abi.decode(data, (MintCallbackData));
        IUniswapV3Pool pool = V3CallbackValidation.verifyCallback(decoded.poolKey, factory, poolInitCodeHash);

        if (amount0Owed > 0) {
            IAllowanceTransfer(PERMIT2).transferFrom(
                decoded.payer,
                address(pool),
                uint160(amount0Owed),
                Currency.unwrap(decoded.poolKey.currency0)
            );
        }
        if (amount1Owed > 0) {
            IAllowanceTransfer(PERMIT2).transferFrom(
                decoded.payer,
                address(pool),
                uint160(amount1Owed),
                Currency.unwrap(decoded.poolKey.currency1)
            );
        }
    }

    /// @notice Add liquidity to an initialized pool
    function addLiquidity(
        V3PoolKey memory poolKey,
        int24 tickLower,
        int24 tickUpper,
        uint128 liquidity,
        address recipient
    ) external returns (uint256 amount0, uint256 amount1) {
        IUniswapV3Pool pool = IUniswapV3Pool(poolKey.computeAddress(factory, poolInitCodeHash));
        (amount0, amount1) = pool.mint(
            recipient,
            tickLower,
            tickUpper,
            liquidity,
            abi.encode(MintCallbackData({poolKey: poolKey, payer: msg.sender}))
        );
    }
}
