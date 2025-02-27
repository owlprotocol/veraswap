# Veraswap SDK

Veraswap contracts and utils.

## Contracts

Contracts are compiled and deployed using Forge.

### Check Forge Installation

*Ensure that you have correctly installed Foundry (Forge) Stable. You can update Foundry by running:*

```bash
foundryup
```

> *v4-template* appears to be *incompatible* with Foundry Nightly. See [foundry announcements](https://book.getfoundry.sh/announcements) to revert back to the stable build

### Set up

*requires [foundry](https://book.getfoundry.sh)*

```bash
forge install
forge build
forge test
```

### Script Simulation

Scripts can be run in the forge simulation

```bash
forge script script/DeployAnvil.s.sol \
    --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
    --code-size-limit 393216
```

### Local Development (Anvil)

Other than writing unit tests (recommended!), you can only deploy & test hooks on [anvil](https://book.getfoundry.sh/anvil/)

```bash
# start anvil, a local EVM chain
anvil --disable-code-size-limit

# in a new terminal
#10x code size limit, some contracts seem to have to be fine tuned
forge script script/DeployAnvil.s.sol \
    --rpc-url http://localhost:8545 \
    --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
    --broadcast \
    --code-size-limit 393216
```

See [script/](script/) for hook deployment, pool creation, liquidity provision, and swapping.

### Manual installation

For custom projects that want to just copy over our forge setup, you can copy the [remappings.tsx](./remappings.txt) and install the dependencies at latest branches. Note we use a custom v3-periphery fork to make it work with latest openzeppelin contracts.

```bash
forge install \
    foundry-rs/forge-std@master \
    openzeppelin/openzeppelin-contracts@master \
    uniswap/permit2@main \
    uniswap/v2-core@master \
    uniswap/v3-core@main \
    leovigna/v3-periphery@main \
    uniswap/v4-core@main \
    uniswap/v4-periphery@main \
    openzeppelin/uniswap-hooks@master \
    uniswap/universal-router@main \
    hyperlane-xyz/hyperlane-monorepo@main
```
