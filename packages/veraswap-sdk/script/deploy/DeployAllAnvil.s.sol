// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {DeployAll} from "../DeployAll.s.sol";
import {DeployAnvil} from "../deployParameters/DeployAnvil.s.sol";

contract DeployAllAnvil is DeployAnvil, DeployAll {}
