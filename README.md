# Veraswap Monrepo

This is the monorepo for the VeraSwap project. It contains the following packages:
- `veraswap-sdk`: Customs contracts, and helpers for swapping and bridging
- `veraswap-app`: The VeraSwap frontend application

## Getting started

### Install dependencies and build

```bash
pnpm install
cd packages/veraswap-sdk/lib/rhinestone-core-modules && pnpm i --ignore-workspace && cd ../../../.. # uses shameful hoisting :(
pnpm build
```

### Full Clean
If you ever run into issues with `node_modules` you can do a full reset as follows
```bash
pnpm run clean && pnpm run clean:node_modules
```

#### TMUX script
```
. ./scripts/veraswap-tmux-two-chains-firebase-secure.sh
```
NOTE: You will need to override the `WORKSPACE`/`VERASWAP` environment variables
