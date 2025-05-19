// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*──────────────────────────────────────────────────────────────────────────────
 * BasketETF – simple on-chain ETF
 *  ◦ Each BasketToken.units is the raw smallest-unit amount required for *1 ETF*.
 *  ◦ No admin, upgradeability or protocol fees.
 *  ◦ ERC-20 pulls use Uniswap Permit2 (hard-coded address).
 *  ◦ Basket is strictly sorted → guarantees uniqueness.
 *  ◦ Native ETH handled via address(0); payable mint, single ETH refund on burn.
 *────────────────────────────────────────────────────────────────────────────*/

import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import {Address} from "openzeppelin-contracts/contracts/utils/Address.sol";

import {IAllowanceTransfer} from "permit2/src/interfaces/IAllowanceTransfer.sol";
import {FullMath} from "@uniswap/v4-core/src/libraries/FullMath.sol";

error EmptyBasket();
error ZeroUnits();
error UnsortedDuplicate(address token);
error ZeroAmount();
error IncorrectETH(uint256 actual, uint256 expected);
error AmountTooLarge(uint256 amount, uint256 max);

/// @title BasketUnitWeighted
/// @notice Simple on-chain basket with fixed units of each asset
contract BasketFixedUnits is ERC20 {
    using SafeERC20 for IERC20;
    using FullMath for uint256;
    using Address for address payable;

    address internal constant NATIVE = address(0); // marks ETH
    address internal constant PERMIT2_ADDR = 0x000000000022D473030F116dDEE9F6B43aC78BA3;

    struct BasketToken {
        // ERC20 address or address(0) for ETH
        address addr;
        // Raw units for 1 ETF raw unit (e.g. 1e18 ETH for 1e18 ETF)
        uint256 units;
    }

    address public immutable owner;
    uint256 public immutable mintFeeCentiBips; // 10_000 = 1% fee
    BasketToken[] public basket;

    /* ───────────── Constructor ───────────── */
    constructor(
        string memory _name,
        string memory _symbol,
        address _owner,
        uint256 _mintFeeCentiBips,
        BasketToken[] memory _basket
    ) ERC20(_name, _symbol) {
        // Validate basket
        if (_basket.length == 0) revert EmptyBasket();

        for (uint256 i; i < _basket.length; i++) {
            // Units must be > 0
            if (_basket[i].units == 0) revert ZeroUnits();
            // Tokens must be sorted by address and unique
            if (i > 0 && _basket[i - 1].addr >= _basket[i].addr) revert UnsortedDuplicate(_basket[i].addr);
        }

        if (_owner == address(0)) {
            // Max mint fee is 0%
            if (_mintFeeCentiBips > 0) {
                revert AmountTooLarge(_mintFeeCentiBips, 0);
            }
        } else {
            // Max mint fee is 1%
            if (_mintFeeCentiBips > 10_000) {
                revert AmountTooLarge(_mintFeeCentiBips, 10_000);
            }
        }

        // Write to storage
        owner = _owner;
        mintFeeCentiBips = _mintFeeCentiBips;
        basket = _basket;
    }

    //TODO: Is this needed?
    function basketLength() external view returns (uint256) {
        return basket.length;
    }

    function mint(uint256 amount, address receiver, address referrer) external payable {
        if (amount == 0) revert ZeroAmount();

        for (uint256 i = 0; i < basket.length; ++i) {
            BasketToken memory token = basket[i];
            uint256 required = amount.mulDivRoundingUp(token.units, 1e18); // round-up (minimum 1 wei)

            if (token.addr == NATIVE) {
                if (msg.value != required) revert IncorrectETH(msg.value, required);
            } else {
                if (required > type(uint160).max) revert AmountTooLarge(required, type(uint160).max);
                IAllowanceTransfer(PERMIT2_ADDR).transferFrom(msg.sender, address(this), uint160(required), token.addr);
            }
        }

        if (mintFeeCentiBips == 0 || receiver == owner) {
            // No fee, mint all to receiver
            _mint(receiver, amount);
        } else {
            // Calculate fee and mint to owner
            uint256 fee = amount.mulDivRoundingUp(mintFeeCentiBips, 1_000_000); // round-up (minimum 1 wei);
            _mint(receiver, amount - fee);

            if (referrer == address(0)) {
                _mint(owner, fee);
            } else {
                //TODO: Add custom fee split logic
                // Referrer gets 50% of the fee
                _mint(referrer, fee / 2);
                _mint(owner, fee / 2);
            }
        }
    }

    function burn(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        _burn(msg.sender, amount);

        uint256 ethSend = 0;

        for (uint256 i = 0; i < basket.length; i++) {
            BasketToken memory token = basket[i];
            uint256 required = amount.mulDiv(token.units, 1e18); // round-down

            if (token.addr == NATIVE) {
                ethSend = required;
            } else {
                IERC20(token.addr).safeTransfer(msg.sender, required);
            }
        }

        if (ethSend != 0) {
            payable(msg.sender).sendValue(ethSend);
        }
    }
}
