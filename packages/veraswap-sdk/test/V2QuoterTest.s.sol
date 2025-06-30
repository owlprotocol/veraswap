// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {IUniswapV2Factory} from "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import {UniswapV2FactoryUtils} from "../script/utils/UniswapV2FactoryUtils.sol";

// ERC20
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
// Permit2
import {Permit2Utils} from "../script/utils/Permit2Utils.sol";
// WETH9
import {WETH} from "solmate/src/tokens/WETH.sol";
import {WETHUtils} from "../script/utils/WETHUtils.sol";
// Uniswap Universal Router
import {IUniversalRouter} from "@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol";
import {Commands} from "@uniswap/universal-router/contracts/libraries/Commands.sol";
// Liquidity Pools
import {LocalTokens, LocalTokensLibrary} from "../script/libraries/LocalTokens.sol";
import {LocalPoolsLibrary, LocalV2Pools} from "../script/libraries/LocalPools.sol";
import {ContractsUniswapLibrary} from "../script/libraries/ContractsUniswap.sol";
import {UniswapContracts} from "../script/Structs.sol";

contract V2QuoterTest is Test {
    LocalV2Pools pools;

    function setUp() public {
        // Sets proper address for Create2 & transaction sender
        vm.startBroadcast();

        // WETH9
        // Set weth9 code to Optimism pre-deploy for anvil local chains that don't have pre-deploy (used by Uniswap V3)
        (address _weth9, ) = WETHUtils.getOrEtch(WETHUtils.opStackPreDeploy);
        LocalTokens memory tokens = LocalTokensLibrary.deploy(_weth9);

        // (address v2Factory, ) = UniswapV2FactoryUtils.getOrCreate2(address(0));

        // Uniswap Contracts
        UniswapContracts memory contracts = ContractsUniswapLibrary.deploy(_weth9);
        // Create V2 Pools
        pools = LocalPoolsLibrary.deployV2Pools(IUniswapV2Factory(contracts.v2Factory), tokens);

        assertNotEq(address(pools.liq2_tokenA), address(0), "L2 Token A pool not created");

        vm.stopBroadcast();
    }

    function testExactInputSingle() public {}
}
