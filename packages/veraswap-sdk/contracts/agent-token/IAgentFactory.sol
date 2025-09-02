// Copied from https://basescan.org/token/0x795abcb2a9901f6ec510e18d40de08b84628c354#code
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/IGovernor.sol";

interface IAgentFactory {
    function proposeAgent(
        string memory name,
        string memory symbol,
        string memory tokenURI,
        uint8[] memory cores,
        bytes32 tbaSalt,
        address tbaImplementation,
        uint32 daoVotingPeriod,
        uint256 daoThreshold
    ) external returns (uint256);

    function withdraw(uint256 id) external;

    function totalAgents() external view returns (uint256);
}
