// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import "forge-std/console2.sol";
// Orbiter
import {OrbiterBridgeSweepUtils} from "../utils/OrbiterBridgeSweepUtils.sol";
// ERC4337
import {SimpleAccountFactoryUtils} from "../utils/SimpleAccountFactoryUtils.sol";
import {OpenPaymasterUtils} from "../utils/OpenPaymasterUtils.sol";
import {BalanceDeltaPaymasterUtils} from "../utils/BalanceDeltaPaymasterUtils.sol";
// Interop
import {SuperchainTokenBridgeSweepUtils} from "../utils/SuperchainTokenBridgeSweepUtils.sol";
// Kernel Account
import {ECDSAValidatorUtils} from "../utils/ECDSAValidatorUtils.sol";
import {KernelUtils} from "../utils/KernelUtils.sol";
import {KernelFactoryUtils} from "../utils/KernelFactoryUtils.sol";
// Kernel Account (custom)
import {OwnableSignatureExecutorUtils} from "../utils/OwnableSignatureExecutorUtils.sol";
import {ERC7579ExecutorRouterUtils} from "../utils/ERC7579ExecutorRouterUtils.sol";
import {ExecuteUtils} from "../utils/ExecuteUtils.sol";
// Custom
import {ExecuteSweepUtils} from "../utils/ExecuteSweepUtils.sol";

import {CoreContracts, HyperlaneDeployParams} from "../Structs.sol";
import {ContractsHyperlaneLibrary} from "./ContractsHyperlane.sol";
import {ContractsUniswapLibrary} from "./ContractsUniswap.sol";

library ContractsCoreLibrary {
    /// @notice Deploy all contracts
    /// @dev ONLY local chains
    function deploy(address weth9) internal returns (CoreContracts memory contracts) {
        // Hyperlane
        contracts.hyperlane = ContractsHyperlaneLibrary.deploy();
        // Uniswap
        contracts.uniswap = ContractsUniswapLibrary.deploy(weth9);
        // Core Contracts
        getOrCreate2(contracts);
        return contracts;
    }

    /// @notice Get or deploy all contracts
    /// @dev Can be used to reconcile with existing deployment
    function getOrDeploy(CoreContracts memory contracts) internal {
        // Hyperlane
        ContractsHyperlaneLibrary.getOrDeploy(HyperlaneDeployParams({mailbox: contracts.hyperlane.mailbox}));
        // Uniswap
        ContractsUniswapLibrary.getOrDeploy(contracts.uniswap);
        // Core Contracts
        getOrCreate2(contracts);
    }

    /// @notice Get or deploy all contracts contracts
    /// @dev Can be used both local and live chains
    function getOrCreate2(CoreContracts memory contracts) private {
        // ERC4337 Contracts
        address entryPoint = 0x0000000071727De22E5E9d8BAf0edAc6f37da032;
        if (entryPoint.code.length > 0) {
            // Contracts require EntryPoint to be already deployed
            SimpleAccountFactoryUtils.getOrCreate2(entryPoint);
            OpenPaymasterUtils.getOrCreate2(entryPoint, msg.sender);
            BalanceDeltaPaymasterUtils.getOrCreate2(entryPoint, msg.sender);
        } else {
            console2.log(
                "entryPoint.code == bytes(0), skipping SimpleAccountFactory and BalanceDeltaPaymaster deployment"
            );
        }

        // Superchain Interop Contracts
        address tokenBridge = 0x4200000000000000000000000000000000000028;
        if (tokenBridge.code.length > 0) {
            // Contracts only work on Superchain Interop chains
            (address superchainTokenBridgeSweep,) = SuperchainTokenBridgeSweepUtils.getOrCreate2();
        }

        // KERNEL CONTRACTS
        (address kernel,) = KernelUtils.getOrCreate2(entryPoint);
        (address kernelFactory,) = KernelFactoryUtils.getOrCreate2(kernel);
        (address ecdsaValidator,) = ECDSAValidatorUtils.getOrCreate2();

        (address ownableSignatureExecutor,) = OwnableSignatureExecutorUtils.getOrCreate2();

        address erc7579ExecutorRouter = address(0);
        if (contracts.hyperlane.mailbox == address(0)) {
            console2.log("mailbox == address(0), skipping ERC7579 Executor deployment");
        } else {
            (erc7579ExecutorRouter,) = ERC7579ExecutorRouterUtils.getOrCreate2(
                contracts.hyperlane.mailbox,
                //TOOD: Use hardcoded ISM (currently this delegates ISM to Mailbox.defaultIsm())
                address(0),
                ownableSignatureExecutor,
                kernelFactory
            );
        }
        (address execute,) = ExecuteUtils.getOrCreate2();
        (address orbiterBridgeSweep,) = OrbiterBridgeSweepUtils.getOrCreate2();
        (address executeSweep,) = ExecuteSweepUtils.getOrCreate2();

        contracts.kernel = kernel;
        contracts.kernelFactory = kernelFactory;
        contracts.ecdsaValidator = ecdsaValidator;
        contracts.ownableSignatureExecutor = ownableSignatureExecutor;
        contracts.erc7579ExecutorRouter = erc7579ExecutorRouter;
        contracts.execute = execute;
        contracts.executeSweep = executeSweep;
        contracts.orbiterBridgeSweep = orbiterBridgeSweep;
    }

    function log(CoreContracts memory contracts) internal pure {
        ContractsUniswapLibrary.log(contracts.uniswap);

        console2.log("mailbox:", contracts.hyperlane.mailbox);
        console2.log("kernel:", contracts.kernel);
        console2.log("kernelFactory:", contracts.kernelFactory);
        console2.log("ecdsaValidator:", contracts.ecdsaValidator);
        console2.log("ownableSignatureExecutor:", contracts.ownableSignatureExecutor);
        console2.log("erc7579ExecutorRouter:", contracts.erc7579ExecutorRouter);
    }
}
