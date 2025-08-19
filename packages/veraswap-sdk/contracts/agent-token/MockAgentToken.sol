// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";
import {ERC20} from "solmate/src/tokens/ERC20.sol";
import "./IErrors.sol";

contract MockAgentToken is MockERC20, IErrors {
    uint256 internal constant BP_DENOM = 10000;

    address public uniswapV2Pair;
    uint16 public projectBuyTaxBasisPoints;
    uint16 public projectSellTaxBasisPoints;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint16 _projectBuyTaxBasisPoints,
        uint16 _projectSellTaxBasisPoints
    ) MockERC20(name, symbol, decimals) {
        projectBuyTaxBasisPoints = _projectBuyTaxBasisPoints;
        projectSellTaxBasisPoints = _projectSellTaxBasisPoints;
    }

    /**
     * @dev function {setLiquidityPoolAddress}
     *
     * Set the liquidity pool address. Assumes here there is o nly one liquidity pool.
     *
     * @param _liquidityPool The address of the liquidity pool
     */
    function setLiquidityPoolAddress(address _liquidityPool) external {
        uniswapV2Pair = _liquidityPool;
    }

    /**
     * @dev function {isLiquidityPool}
     *
     * Return if an address is a liquidity pool
     *
     * @param queryAddress_ The address being queried
     * @return bool The address is / isn't a liquidity pool
     */
    function isLiquidityPool(address queryAddress_) public view returns (bool) {
        return queryAddress_ == uniswapV2Pair;
    }

    /**
     * @dev totalBuyTaxBasisPoints
     *
     * Provide easy to view tax total:
     */
    function totalBuyTaxBasisPoints() public view returns (uint256) {
        return projectBuyTaxBasisPoints;
    }

    /**
     * @dev totalSellTaxBasisPoints
     *
     * Provide easy to view tax total:
     */
    function totalSellTaxBasisPoints() public view returns (uint256) {
        return projectSellTaxBasisPoints;
    }

    function _pretaxValidationAndLimits(address from_, address to_, uint256 amount_)
        internal
        view
        returns (uint256 fromBalance_)
    {
        if (from_ == address(0)) {
            revert TransferFromZeroAddress();
        }

        if (to_ == address(0)) {
            revert TransferToZeroAddress();
        }

        fromBalance_ = balanceOf[from_];

        if (fromBalance_ < amount_) {
            revert TransferAmountExceedsBalance();
        }

        return (fromBalance_);
    }

    /**
     * @dev function {_taxProcessing}
     *
     * Perform tax processing
     *
     * @param applyTax_ Do we apply tax to this transaction?
     * @param to_ The reciever of the token
     * @param from_ The sender of the token
     * @param sentAmount_ The amount being send
     * @return amountLessTax_ The amount that will be recieved, i.e. the send amount minus tax
     */
    function _taxProcessing(bool applyTax_, address to_, address from_, uint256 sentAmount_)
        internal
        returns (uint256 amountLessTax_)
    {
        amountLessTax_ = sentAmount_;

        if (!applyTax_) {
            return amountLessTax_;
        }

        uint256 tax;

        // on sell
        if (isLiquidityPool(to_) && totalSellTaxBasisPoints() > 0) {
            if (projectSellTaxBasisPoints > 0) {
                uint256 projectTax = ((sentAmount_ * projectSellTaxBasisPoints) / BP_DENOM);
                // In theory, we could keep track of tax waiting to be collected
                // projectTaxPendingSwap += uint128(projectTax);
                tax += projectTax;
            }
        }
        // on buy
        else if (isLiquidityPool(from_) && totalBuyTaxBasisPoints() > 0) {
            if (projectBuyTaxBasisPoints > 0) {
                uint256 projectTax = ((sentAmount_ * projectBuyTaxBasisPoints) / BP_DENOM);
                // In theory, we could keep track of tax waiting to be collected
                // projectTaxPendingSwap += uint128(projectTax);
                tax += projectTax;
            }
        }

        if (tax > 0) {
            balanceOf[address(this)] += tax;
            emit Transfer(from_, address(this), tax);
            amountLessTax_ -= tax;
        }
    }

    function transfer(address to, uint256 amount) public virtual override(ERC20) returns (bool) {
        _pretaxValidationAndLimits(msg.sender, to, amount);
        balanceOf[msg.sender] -= amount;

        uint256 tax = (amount * 1) / 100; // 1% tax
        bool applyTax = msg.sender != address(this) && to != address(this);
        uint256 amountMinusTax = _taxProcessing(applyTax, to, msg.sender, amount - tax);

        // Cannot overflow because the sum of all user
        // balances can't exceed the max uint256 value.
        unchecked {
            balanceOf[to] += amount - tax;
            balanceOf[address(this)] += tax; // Collect tax in the contract itself
        }

        emit Transfer(msg.sender, to, amountMinusTax);

        return true;
    }
}
