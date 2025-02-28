// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {DeployAll} from "../DeployAll.s.sol";
import {DeploySepolia} from "../deployParameters2/DeploySepolia.s.sol";

contract DeployAllSepolia is DeploySepolia, DeployAll {}
