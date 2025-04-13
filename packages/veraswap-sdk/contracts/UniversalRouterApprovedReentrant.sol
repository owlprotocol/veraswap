// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.24;

// Command implementations
import {RouterParameters} from "@uniswap/universal-router/contracts/types/RouterParameters.sol";
import {PaymentsImmutables, PaymentsParameters} from "@uniswap/universal-router/contracts/modules/PaymentsImmutables.sol";
import {UniswapImmutables, UniswapParameters} from "@uniswap/universal-router/contracts/modules/uniswap/UniswapImmutables.sol";
import {V4SwapRouter} from "@uniswap/universal-router/contracts/modules/uniswap/v4/V4SwapRouter.sol";
import {Commands} from "@uniswap/universal-router/contracts/libraries/Commands.sol";
import {IUniversalRouter} from "@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol";
import {MigratorImmutables, MigratorParameters} from "@uniswap/universal-router/contracts/modules/MigratorImmutables.sol";
import {DispatcherApprovedReentrant} from "./DispatcherApprovedReentrant.sol";

/**
 * Universal Router designed for maximum composability with contracts using TSTORE based callback patterns
 * Allows the original caller to set an APPROVED_REENTRANT to reenter the router
 * Combined with CALL_TARGET this enables contracts to execute router commands on behalf of the user (msgSender remains the original locker)
 *
 * Consider the use case of a collateral based bridging contract that uses flash accounting.
 * The goal is to execute a swap from the user to the collateral-based bridging contract via only 2 ERC20 transfers (user => pool, pool => bridge)
 * and then execute the bridging call to the bridging protocol's messaging contract.
 *
 * - User calls UniversalRouter
 * - msgSender is stored using TSTORE
 * - Router is locked: only self-reentrancy and approved reentrancy is allowed
 * - APPROVE_REENTRANT: TSTORE approved reentrant
 * - CALL_TARGET: Call target contract, most often this contract will reenter the router
 *
 * We introduce the following commands
 * - APPROVE_REENTRANT: Set approved reentrant. Warning: For maximum composability, reentrant can execute ANY command including APPROVE_REENTRANT
 * - CALL_TARGET: Call target. This does NOT have to be same address as the approved reentrant (though )

 * The following changes are made to Dispatcher and UniversalRouter as DispatcherReentrant and UniversalRouterReentrant.
 * We have to copy over the code because certain functions are not overridable.
 * - Add APPROVE_REENTRANT, CALL_TARGET commands to CommandsReentrant.sol
 * - Update `Dispatch.dispatch()` to implement new commands in DispatcherReentrant.sol
 * - Update `Dispatch.msgSender()` to from MSG_SENDER
 * - Replace `Lock.isNotLocked` modifier with `LockWithApprovedReentrant` which has `isNotLockedOrApprovedReentrant` modifier and `setApprovedReentrant`/`getApprovedReentrant` utils
 *
 * The changes introduce the following invariants
 * - `getLocker` / `msgSender` behaviour are unchanged: the msgSender is ALWAYS the first `msg.sender` value to call `execute` (and "lock")
 * - `execute` can be called: when unlocked, with self-reentrancy, with approved reentrant
 */
contract UniversalRouterApprovedReentrant is IUniversalRouter, DispatcherApprovedReentrant {
    constructor(
        RouterParameters memory params
    )
        UniswapImmutables(
            UniswapParameters(params.v2Factory, params.v3Factory, params.pairInitCodeHash, params.poolInitCodeHash)
        )
        V4SwapRouter(params.v4PoolManager)
        PaymentsImmutables(PaymentsParameters(params.permit2, params.weth9))
        MigratorImmutables(MigratorParameters(params.v3NFTPositionManager, params.v4PositionManager))
    {}

    modifier checkDeadline(uint256 deadline) {
        if (block.timestamp > deadline) revert TransactionDeadlinePassed();
        _;
    }

    /// @notice To receive ETH from WETH
    receive() external payable {
        if (msg.sender != address(WETH9) && msg.sender != address(poolManager)) revert InvalidEthSender();
    }

    /// @inheritdoc IUniversalRouter
    function execute(
        bytes calldata commands,
        bytes[] calldata inputs,
        uint256 deadline
    ) external payable checkDeadline(deadline) {
        execute(commands, inputs);
    }

    /// @inheritdoc DispatcherApprovedReentrant
    function execute(
        bytes calldata commands,
        bytes[] calldata inputs
    ) public payable override isNotLockedOrApprovedReentrant {
        bool success;
        bytes memory output;
        uint256 numCommands = commands.length;
        if (inputs.length != numCommands) revert LengthMismatch();

        // loop through all given commands, execute them and pass along outputs as defined
        for (uint256 commandIndex = 0; commandIndex < numCommands; commandIndex++) {
            bytes1 command = commands[commandIndex];

            bytes calldata input = inputs[commandIndex];

            (success, output) = dispatch(command, input);

            if (!success && successRequired(command)) {
                revert ExecutionFailed({commandIndex: commandIndex, message: output});
            }
        }
    }

    function successRequired(bytes1 command) internal pure returns (bool) {
        return command & Commands.FLAG_ALLOW_REVERT == 0;
    }
}
