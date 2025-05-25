// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {StateLibrary} from "@uniswap/v4-core/src/libraries/StateLibrary.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {ParseBytes} from "@uniswap/v4-core/src/libraries/ParseBytes.sol";

import {PathKey} from "@uniswap/v4-periphery/src/libraries/PathKey.sol";
import {QuoterRevert} from "@uniswap/v4-periphery/src/libraries/QuoterRevert.sol";

// Base quoters
import {V3MetaQuoterBase} from "./v3/V3MetaQuoterBase.sol";
import {V4MetaQuoterBase} from "./V4MetaQuoterBase.sol";

import {IMetaQuoter} from "./IMetaQuoter.sol";

/// @title MetaQuoter
/// @notice Supports quoting and routing optimal trade using logic by getting balance delta across multiple routes for v3/v4 pools
/// @dev These functions are not marked view because they rely on calling non-view functions and reverting
/// to compute the result. They are also not gas efficient and should not be called on-chain.
contract MetaQuoter is IMetaQuoter, V3MetaQuoterBase, V4MetaQuoterBase {
    using QuoterRevert for *;
    using ParseBytes for bytes;

    /// @param _factory The address of the Uniswap V3 factory contract
    /// @param _poolInitCodeHash The init code hash of the V3 pool
    /// @param _poolManager The address of the Uniswap V4 pool manager contract
    constructor(
        address _factory,
        bytes32 _poolInitCodeHash,
        IPoolManager _poolManager
    ) V3MetaQuoterBase(_factory, _poolInitCodeHash) V4MetaQuoterBase(_poolManager) {}

    /// @inheritdoc IMetaQuoter
    function metaQuoteExactInputSingle(
        MetaQuoteExactSingleParams memory params
    ) public returns (MetaQuoteExactSingleResult[] memory swaps) {}

    /// @inheritdoc IMetaQuoter
    function metaQuoteExactOutputSingle(
        MetaQuoteExactSingleParams memory params
    ) public returns (MetaQuoteExactSingleResult[] memory swaps) {}

    /// @inheritdoc IMetaQuoter
    function metaQuoteExactInput(
        MetaQuoteExactParams memory params
    ) external returns (MetaQuoteExactResult[] memory swaps) {}

    /// @inheritdoc IMetaQuoter
    function metaQuoteExactOutput(
        MetaQuoteExactParams memory params
    ) external returns (MetaQuoteExactResult[] memory swaps) {}

    /// @inheritdoc IMetaQuoter
    function metaQuoteExactInputBest(
        MetaQuoteExactParams memory params
    )
        external
        returns (
            MetaQuoteExactSingleResult memory bestSingleSwap,
            MetaQuoteExactResult memory bestMultihopSwap,
            BestSwap bestSwapType
        )
    {}

    /// @inheritdoc IMetaQuoter
    function metaQuoteExactOutputBest(
        MetaQuoteExactParams memory params
    )
        external
        returns (
            MetaQuoteExactSingleResult memory bestSingleSwap,
            MetaQuoteExactResult memory bestMultihopSwap,
            BestSwap bestSwapType
        )
    {}
}
