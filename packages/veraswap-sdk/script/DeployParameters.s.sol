// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/console2.sol";
import "forge-std/Script.sol";
import "forge-std/Test.sol";

import {RouterParameters} from "@uniswap/universal-router/contracts/types/RouterParameters.sol";
import {IStateView} from "@uniswap/v4-periphery/src/interfaces/IStateView.sol";
import {IV4Quoter} from "@uniswap/v4-periphery/src/interfaces/IV4Quoter.sol";
import {IUniversalRouter} from "@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol";

struct HyperlaneParameters {
    address mailbox;
}

/// @notice Shared Deploy Parameters
abstract contract DeployParameters is Script, Test {
    RouterParameters internal params;

    IUniversalRouter internal router;
    IV4Quoter internal v4Quoter;
    IStateView internal v4StateView;

    MockERC20[] tokens;
    HyperlaneParameters internal hyperlaneParams;
    address internal unsupported;

    address constant UNSUPPORTED_PROTOCOL = address(0);
    bytes32 constant BYTES32_ZERO = bytes32(0);
    bytes constant ZERO_BYTES = new bytes(0);

    error Permit2NotDeployed();

    function setUp() public virtual;

    function logParams() internal view {
        console2.log("***** UNISWAP PARAMS *****");
        console2.log("permit2:", params.permit2);
        console2.log("weth9:", params.weth9);
        console2.log("v2Factory:", params.v2Factory);
        console2.log("v3Factory:", params.v3Factory);
        console2.log("v4PoolManager:", params.v4PoolManager);
        console2.log("v3NFTPositionManager:", params.v3NFTPositionManager);
        console2.log("v4PositionManager:", params.v4PositionManager);
        console2.log("v4Quoter:", address(v4Quoter));

        console2.log("***** HYPERLANE PARAMS *****");
        console2.log("mailbox:", hyperlaneParams.mailbox);
    }

    function mapUnsupported(address protocol) internal view returns (address) {
        return protocol == address(0) ? unsupported : protocol;
    }
}
