// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import "forge-std/console2.sol";

// Hyperlane
import {HyperlanePausableHookUtils} from "../utils/HyperlanePausableHookUtils.sol";
import {HyperlaneNoopIsmUtils} from "../utils/HyperlaneNoopIsmUtils.sol";
import {HyperlaneMailboxUtils} from "../utils/HyperlaneMailboxUtils.sol";
import {HypTokenRouterSweepUtils} from "../utils/HypTokenRouterSweepUtils.sol";
import {MockInterchainGasPaymasterUtils} from "../utils/MockInterchainGasPaymasterUtils.sol";
// Contract Structs
import {HyperlaneContracts, HyperlaneDeployParams} from "../Structs.sol";

library ContractsHyperlaneLibrary {
    /// @notice Deploy core Hyperlane contracts
    /// @dev ONLY local chains
    function deployHyperlaneParams() internal returns (HyperlaneDeployParams memory) {
        uint32 chainId = uint32(block.chainid);
        // Local testing contracts
        (address ism, ) = HyperlaneNoopIsmUtils.getOrCreate2();
        (address hook, ) = HyperlanePausableHookUtils.getOrCreate2();
        (address mockInterchainGasPaymaster, ) = MockInterchainGasPaymasterUtils.getOrCreate2();
        (address mailbox, ) = HyperlaneMailboxUtils.getOrCreate2(chainId, ism, hook);

        return HyperlaneDeployParams({mailbox: mailbox});
    }

    /// @notice Deploy all Hyperlane contracts
    /// @dev ONLY local chains
    function deploy() internal returns (HyperlaneContracts memory) {
        HyperlaneDeployParams memory params = deployHyperlaneParams();
        // (address testRecipient, ) = HyperlaneTestRecipientUtils.getOrCreate2();
        (address hypTokenRouterSweep, ) = HypTokenRouterSweepUtils.getOrCreate2();
        return
            HyperlaneContracts({
                mailbox: params.mailbox,
                testRecipient: address(0),
                hypTokenRouterSweep: hypTokenRouterSweep
            });
    }

    /// @notice Get or deploy Hyperlane contracts
    /// @dev Can be used to reconcile with existing deployment
    function getOrDeploy(HyperlaneDeployParams memory params) internal returns (HyperlaneContracts memory contracts) {
        if (params.mailbox == address(0)) {
            console2.log("mailbox == address(0), skipping Hyperlane deployment");
        } else {
            // (address testRecipient, ) = HyperlaneTestRecipientUtils.getOrCreate2();
            (address hypTokenRouterSweep, ) = HypTokenRouterSweepUtils.getOrCreate2();
            contracts = HyperlaneContracts({
                mailbox: params.mailbox,
                testRecipient: address(0),
                hypTokenRouterSweep: hypTokenRouterSweep
            });
        }
    }
}
