// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {PathKey} from "@uniswap/v4-periphery/src/libraries/PathKey.sol";
import {IV4MetaQuoter} from "./IV4MetaQuoter.sol";

/// @title IMetaQuoter
/// @notice Interface for MetaQuoter, a contract that searches for multiple quotes across v3/v4 pools
interface IMetaQuoter {
    /// @notice Returns list of single quotes for a given exact input swap
    /// @param params the params for the quote, encoded as 'MetaQuoteExactSingleParams'
    /// @param v3FeeOptions The fee options for Uniswap V3 pools
    /// @return quotes Single swap quote results
    function metaQuoteExactInputSingle(
        IV4MetaQuoter.MetaQuoteExactSingleParams memory params,
        uint24[] memory v3FeeOptions
    ) external returns (IV4MetaQuoter.MetaQuoteExactSingleResult[] memory quotes);

    /// @notice Returns list of single quotes for a given exact output swap
    /// @param params the params for the quote, encoded as 'MetaQuoteExactSingleParams'
    /// @param v3FeeOptions The fee options for Uniswap V3 pools
    /// @return quotes Single swap quote results
    function metaQuoteExactOutputSingle(
        IV4MetaQuoter.MetaQuoteExactSingleParams memory params,
        uint24[] memory v3FeeOptions
    ) external returns (IV4MetaQuoter.MetaQuoteExactSingleResult[] memory quotes);

    /// @notice Returns list of multihop quotes for a given exact input swap
    /// @param params the params for the quote, encoded as 'MetaQuoteExactParams'
    /// @param v3FeeOptions The fee options for Uniswap V3 pools
    /// @return quotes Multihop swap quote results
    function metaQuoteExactInput(
        IV4MetaQuoter.MetaQuoteExactParams memory params,
        uint24[] memory v3FeeOptions
    ) external returns (IV4MetaQuoter.MetaQuoteExactResult[] memory quotes);

    /// @notice Returns list of multihop quotes for a given exact output swap
    /// @param params the params for the quote, encoded as 'MetaQuoteExactParams'
    /// @param v3FeeOptions The fee options for Uniswap V3 pools
    /// @return quotes Multihop swap quote results
    function metaQuoteExactOutput(
        IV4MetaQuoter.MetaQuoteExactParams memory params,
        uint24[] memory v3FeeOptions
    ) external returns (IV4MetaQuoter.MetaQuoteExactResult[] memory quotes);

    /// @notice Returns the best single swap and multihop swap quote for a given exact input swap
    /// @param params the params for the quote, encoded as 'MetaQuoteExactParams'
    /// @param v3FeeOptions The fee options for Uniswap V3 pools
    /// @return bestSingleSwap Best single swap quote result
    /// @return bestMultihopSwap Best multihop quote result
    /// @return bestSwapType The type of the best swap (single or multihop or none)
    function metaQuoteExactInputBest(
        IV4MetaQuoter.MetaQuoteExactParams memory params,
        uint24[] memory v3FeeOptions
    )
        external
        returns (
            IV4MetaQuoter.MetaQuoteExactSingleResult memory bestSingleSwap,
            IV4MetaQuoter.MetaQuoteExactResult memory bestMultihopSwap,
            IV4MetaQuoter.BestSwap bestSwapType
        );

    /// @notice Returns the best single swap and multihop swap quote for a given exact output swap
    /// @param params the params for the quote, encoded as 'MetaQuoteExactParams'
    /// @param v3FeeOptions The fee options for Uniswap V3 pools
    /// @return bestSingleSwap Best single swap quote result
    /// @return bestMultihopSwap Best multihop quote result
    /// @return bestSwapType The type of the best swap (single or multihop or none)
    function metaQuoteExactOutputBest(
        IV4MetaQuoter.MetaQuoteExactParams memory params,
        uint24[] memory v3FeeOptions
    )
        external
        returns (
            IV4MetaQuoter.MetaQuoteExactSingleResult memory bestSingleSwap,
            IV4MetaQuoter.MetaQuoteExactResult memory bestMultihopSwap,
            IV4MetaQuoter.BestSwap bestSwapType
        );
}
