// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {StateLibrary} from "@uniswap/v4-core/src/libraries/StateLibrary.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {ParseBytes} from "@uniswap/v4-core/src/libraries/ParseBytes.sol";

import {IV4Quoter} from "@uniswap/v4-periphery/src/interfaces/IV4Quoter.sol";
import {PathKey} from "@uniswap/v4-periphery/src/libraries/PathKey.sol";
import {QuoterRevert} from "@uniswap/v4-periphery/src/libraries/QuoterRevert.sol";
import {BaseV4Quoter} from "@uniswap/v4-periphery/src/base/BaseV4Quoter.sol";

import {IV4MetaQuoter} from "./IV4MetaQuoter.sol";
import {V4MetaQuoterBase} from "./V4MetaQuoterBase.sol";

/// @title V4MetaQuoter
/// @notice Supports quoting and routing optimal trade using logic by getting balance delta across multiple routes
/// similar to how V4Quoter
/// @dev These functions are not marked view because they rely on calling non-view functions and reverting
/// to compute the result. They are also not gas efficient and should not be called on-chain.
contract V4MetaQuoter is IV4MetaQuoter, V4MetaQuoterBase {
    using QuoterRevert for *;
    using ParseBytes for bytes;

    constructor(IPoolManager _poolManager) V4MetaQuoterBase(_poolManager) {}

    /// @inheritdoc IV4MetaQuoter
    function metaQuoteExactInputSingle(
        MetaQuoteExactSingleParams memory params
    ) external returns (MetaQuoteExactSingleResult[] memory) {
        return _metaQuoteExactInputSingle(params);
    }

    /// @inheritdoc IV4MetaQuoter
    function metaQuoteExactOutputSingle(
        MetaQuoteExactSingleParams memory params
    ) external returns (MetaQuoteExactSingleResult[] memory) {
        return _metaQuoteExactOutputSingle(params);
    }

    /// @inheritdoc IV4MetaQuoter
    function metaQuoteExactInput(MetaQuoteExactParams memory params) external returns (MetaQuoteExactResult[] memory) {
        return _metaQuoteExactInput(params);
    }

    /// @inheritdoc IV4MetaQuoter
    function metaQuoteExactOutput(MetaQuoteExactParams memory params) external returns (MetaQuoteExactResult[] memory) {
        return _metaQuoteExactOutput(params);
    }

    /// @inheritdoc IV4MetaQuoter
    function metaQuoteExactInputBest(
        MetaQuoteExactParams memory params
    ) external returns (MetaQuoteExactSingleResult memory, MetaQuoteExactResult memory, BestSwap) {
        return _metaQuoteExactInputBest(params);
    }

    /// @inheritdoc IV4MetaQuoter
    function metaQuoteExactOutputBest(
        MetaQuoteExactParams memory params
    ) external returns (MetaQuoteExactSingleResult memory, MetaQuoteExactResult memory, BestSwap) {
        return _metaQuoteExactOutputBest(params);
    }
}
