# Veraswap Monrepo

This is the monorepo for the VeraSwap project. It contains the following packages:
- `veraswap-sdk`: Customs contracts, and helpers for swapping and bridging
- `veraswap-app`: The VeraSwap frontend application

## Getting started

### Install dependencies and build

```bash
pnpm install && cd packages/veraswap-sdk/lib/rhinestone-core-modules && pnpm i --ignore-workspace # uses shameful hoisting :(
pnpm build
```

#### TMUX script
```
. ./scripts/veraswap-tmux-two-chains-firebase-secure.sh
```
NOTE: You will need to override the `WORKSPACE`/`VERASWAP` environment variables
