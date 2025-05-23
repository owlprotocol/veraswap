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
cd lib/hyperlane-monorepo && yarn
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

### Mainnet Deployment
For mainnet deployments we MUST use some existing official deployed contracts as parameters (eg. PoolManager, Mailbox, Kernel):
- Uniswap Router Params: https://github.com/Uniswap/universal-router/tree/main/script/deployParameters
- Uniswap View Contracts: https://docs.uniswap.org/contracts/v4/deployments
- Hyperlane: https://github.com/hyperlane-xyz/hyperlane-registry/tree/main/chains
- Kernel: https://github.com/zerodevapp/kernel (3.1)

**Deploy Core Contracts**
Run the [DeployCoreContracts.s.sol](./script/DeployCoreContracts.s.sol) to deploy core immutable contracts.
```bash
forge script ./script/DeployCoreContracts.s.sol --broadcast --private-key $PRIVATE_KEY --rpc-url sepolia --verify
```

If verification failed for some reason, you can re-run using `--resume` flag:
```bash
forge script ./script/DeployCoreContracts.s.sol --resume --private-key $PRIVATE_KEY --rpc-url sepolia --verify
```


Both `HypTokenRouterSweep` and `OrbiterBridgeSweep` need to be configured to approve any ERC20 being transferred. For Orbiter specifically, you need to approve the USDC address on each chain.

> Current Etherscan v1 Endpoints https://docs.etherscan.io/getting-started/endpoint-urls
> Note: Etherscan [v2 API](https://docs.etherscan.io/etherscan-v2) not supported by forge yet as seen in [foundry/issues/9196](https://github.com/foundry-rs/foundry/issues/9196)

**Deploy Tokens & Pools**
Run [DeployTestnet.s.sol](./script/DeployTestnet.s.sol) script to deploy tokens & pools. This uses forge multichain deployment which *does not seem* (is this the case?) support verification.
```bash
forge script ./script/DeployTestnet.s.sol --broadcast --private-key $PRIVATE_KEY
```

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
    hyperlane-xyz/hyperlane-monorepo@main \
    ethereum-optimism/interop-lib@6093117
```
