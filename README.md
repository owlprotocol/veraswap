# Veraswap Monrepo

This is the monorepo for the VeraSwap project. It contains the following packages:
- `veraswap-sdk`: Customs contracts, and helpers for swapping and bridging
- `veraswap-app`: The VeraSwap frontend application

## Getting started

### Clone with submodules
Clone the repo with submodules and optional 8 thread concurrency.
```bash
git clone --recurse-submodules -j8
```

### Install dependencies and build

```bash
pnpm install
cd packages/veraswap-sdk/lib/rhinestone-core-modules && pnpm i --ignore-workspace && cd ../../../.. # uses shameful hoisting :(
pnpm build
```

### Build Blocksout (optional)

We use [scoutup](https://github.com/blockscout/scoutup) to run a local Blockscout instance configured to work with [supersim](https://github.com/ethereum-optimism/supersim)
```bash
cd tools/scoutup && go build
```

### Full Clean
If you ever run into issues with `node_modules` you can do a full reset as follows
```bash
pnpm run clean && pnpm run clean:node_modules
```

### Local Dev Script
We use [mprocs](https://github.com/pvolok/mprocs) to run multiple scripts in parrallel. This is configured in [mprocs.yaml](./mprocs.yaml)

```bash
pnpm run dev # Starts mprocs
```
