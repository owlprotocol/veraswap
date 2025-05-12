// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/interfaces/IERC20.sol";

/**
    * @title IOrbiterXRouter
* @dev A contract for batch transfers of Ether and tokens to multiple addresses.
        * @dev Inspired from https://polygonscan.com/address/0x653f25dc641544675338CB47057f8ea530c69B78#code
            */
interface IOrbiterXRouter {
    event Transfer(address indexed to, uint256 amount);

    /**
        * @dev Batch transfers Ether to multiple addresses.
        * @param tos The array of destination addresses.
        * @param values The array of corresponding amounts to be transferred.
        */
    function transfers(
        address[] calldata tos,
        uint[] memory values
    ) external payable;

    /**
        * @dev Batch transfers tokens to multiple addresses.
        * @param token The token contract address.
        * @param tos The array of destination addresses.
        * @param values The array of corresponding amounts to be transferred.
        */
    function transferTokens(
        IERC20 token,
        address[] calldata tos,
        uint[] memory values
    ) external payable;

    /**
        * @dev Transfer Ether to a specified address.
        * @param to The destination address.
        * @param data Optional data included in the transaction.
        */
    function transfer(
        address to,
        bytes calldata data
    ) external payable;

    /**
        * @dev Transfer tokens to a specified address.
        * @param token The token contract address.
        * @param to The destination address.
        * @param value The amount of tokens to be transferred.
        * @param data Optional data included in the transaction.
        */
    function transferToken(
        IERC20 token,
        address to,
        uint value,
        bytes calldata data
    ) external payable;
}
