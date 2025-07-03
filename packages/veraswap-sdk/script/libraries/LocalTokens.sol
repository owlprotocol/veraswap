// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

// ERC20
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";
import {MockERC20Utils} from "../utils/MockERC20Utils.sol";
// Permit2
import {IAllowanceTransfer} from "permit2/src/interfaces/IAllowanceTransfer.sol";
// WETH9
import {WETH} from "solmate/src/tokens/WETH.sol";

struct LocalTokens {
    IERC20 weth9;
    IERC20 liq34;
    IERC20 liq2;
    IERC20 liq3;
    IERC20 liq4;
    IERC20 tokenA;
    IERC20 tokenB;
    IERC20 tokenZ;
}

library LocalTokensLibrary {
    address constant permit2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;

    function deploy(address _weth9) internal returns (LocalTokens memory tokens) {
        // Tokens
        (address _liq34,) = MockERC20Utils.getOrCreate2("Liquid V34", "L34", 18);
        (address _liq2,) = MockERC20Utils.getOrCreate2("Liquid V2", "L2", 18);
        (address _liq3,) = MockERC20Utils.getOrCreate2("Liquid V3", "L3", 18);
        (address _liq4,) = MockERC20Utils.getOrCreate2("Liquid V4", "L4", 18);
        (address _tokenA,) = MockERC20Utils.getOrCreate2("Token A", "A", 18);
        (address _tokenB,) = MockERC20Utils.getOrCreate2("Token B", "B", 18);
        (address _tokenZ,) = MockERC20Utils.getOrCreate2("Token Z", "Z", 18);
        IERC20 weth9 = IERC20(_weth9);
        IERC20 liq34 = IERC20(_liq34);
        IERC20 liq2 = IERC20(_liq2);
        IERC20 liq3 = IERC20(_liq3);
        IERC20 liq4 = IERC20(_liq4);
        IERC20 tokenA = IERC20(_tokenA);
        IERC20 tokenB = IERC20(_tokenB);
        IERC20 tokenZ = IERC20(_tokenZ);
        tokens = LocalTokens({
            weth9: weth9,
            liq34: liq34,
            liq2: liq2,
            liq3: liq3,
            liq4: liq4,
            tokenA: tokenA,
            tokenB: tokenB,
            tokenZ: tokenZ
        });
        // Mint tokens
        WETH(payable(address(weth9))).deposit{value: 100 ether}();
        MockERC20(address(liq34)).mint(msg.sender, 100_000 ether);
        MockERC20(address(liq2)).mint(msg.sender, 100_000 ether);
        MockERC20(address(liq3)).mint(msg.sender, 100_000 ether);
        MockERC20(address(liq4)).mint(msg.sender, 100_000 ether);
        MockERC20(address(tokenA)).mint(msg.sender, 100_000 ether);
        MockERC20(address(tokenB)).mint(msg.sender, 100_000 ether);
        MockERC20(address(tokenZ)).mint(msg.sender, 100_000 ether);
        // Approve Permit2
        weth9.approve(permit2, type(uint256).max);
        liq34.approve(permit2, type(uint256).max);
        liq2.approve(permit2, type(uint256).max);
        liq3.approve(permit2, type(uint256).max);
        liq4.approve(permit2, type(uint256).max);
        tokenA.approve(permit2, type(uint256).max);
        tokenB.approve(permit2, type(uint256).max);
        tokenZ.approve(permit2, type(uint256).max);
    }

    function approve(LocalTokens memory tokens, address spender) internal {
        tokens.weth9.approve(spender, type(uint256).max);
        tokens.liq34.approve(spender, type(uint256).max);
        tokens.liq2.approve(spender, type(uint256).max);
        tokens.liq3.approve(spender, type(uint256).max);
        tokens.liq4.approve(spender, type(uint256).max);
        tokens.tokenA.approve(spender, type(uint256).max);
        tokens.tokenB.approve(spender, type(uint256).max);
        tokens.tokenZ.approve(spender, type(uint256).max);
    }

    function permit2Approve(LocalTokens memory tokens, address spender) internal {
        // Permit2 Approve
        IAllowanceTransfer(permit2).approve(address(tokens.weth9), spender, type(uint160).max, type(uint48).max);
        IAllowanceTransfer(permit2).approve(address(tokens.liq34), spender, type(uint160).max, type(uint48).max);
        IAllowanceTransfer(permit2).approve(address(tokens.liq2), spender, type(uint160).max, type(uint48).max);
        IAllowanceTransfer(permit2).approve(address(tokens.liq3), spender, type(uint160).max, type(uint48).max);
        IAllowanceTransfer(permit2).approve(address(tokens.liq4), spender, type(uint160).max, type(uint48).max);
        IAllowanceTransfer(permit2).approve(address(tokens.tokenA), spender, type(uint160).max, type(uint48).max);
        IAllowanceTransfer(permit2).approve(address(tokens.tokenB), spender, type(uint160).max, type(uint48).max);
        IAllowanceTransfer(permit2).approve(address(tokens.tokenZ), spender, type(uint160).max, type(uint48).max);
    }
}
