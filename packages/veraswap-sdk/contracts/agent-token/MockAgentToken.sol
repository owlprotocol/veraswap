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

    function _transfer(address from, address to, uint256 amount, bool applyTax) internal virtual {
        _pretaxValidationAndLimits(from, to, amount);

        uint256 amountMinusTax = _taxProcessing(applyTax, to, from, amount);

        // Cannot overflow because the sum of all user
        // balances can't exceed the max uint256 value.
        unchecked {
            balanceOf[from] -= amount;
            balanceOf[to] += amountMinusTax;
        }

        emit Transfer(from, to, amountMinusTax);
    }

    function transfer(address to, uint256 amount) public virtual override(ERC20) returns (bool) {
        address owner = msg.sender;
        _transfer(owner, to, amount, (isLiquidityPool(owner) || isLiquidityPool(to)));
        return true;
    }

    /**
     * @dev Sets `amount` as the allowance of `spender` over the `owner` s tokens.
     *
     * This internal function is equivalent to `approve`, and can be used to
     * e.g. set automatic allowances for certain subsystems, etc.
     *
     * Emits an {Approval} event.
     *
     * Requirements:
     *
     * - `owner` cannot be the zero address.
     * - `spender` cannot be the zero address.
     */
    function _approve(address owner, address spender, uint256 amount) internal virtual {
        if (owner == address(0)) {
            revert ApproveFromTheZeroAddress();
        }

        if (spender == address(0)) {
            revert ApproveToTheZeroAddress();
        }

        allowance[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    /**
     * @dev Updates `owner` s allowance for `spender` based on spent `amount`.
     *
     * Does not update the allowance amount in case of infinite allowance.
     * Revert if not enough allowance is available.
     *
     * Might emit an {Approval} event.
     */
    function _spendAllowance(address owner, address spender, uint256 amount) internal virtual {
        uint256 currentAllowance = allowance[owner][spender];
        if (currentAllowance != type(uint256).max) {
            if (currentAllowance < amount) {
                revert InsufficientAllowance();
            }

            unchecked {
                _approve(owner, spender, currentAllowance - amount);
            }
        }
    }

    /**
     * @dev See {IERC20-transferFrom}.
     *
     * Emits an {Approval} event indicating the updated allowance. This is not
     * required by the EIP. See the note at the beginning of {ERC20}.
     *
     * NOTE: Does not update the allowance if the current allowance
     * is the maximum `uint256`.
     *
     * Requirements:
     *
     * - `from` and `to` cannot be the zero address.
     * - `from` must have a balance of at least `amount`.
     * - the caller must have allowance for ``from``'s tokens of at least
     * `amount`.
     */
    function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {
        address spender = msg.sender;
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount, (isLiquidityPool(from) || isLiquidityPool(to)));
        return true;
    }
}
