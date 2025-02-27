import { encodeAbiParameters, Hex } from 'viem'
import { AbiParametersToPrimitiveTypes } from 'abitype'
/**
 * Actions
 * @description Constants that define what action to perform
 * Not all actions are supported yet.
 * @enum {number}
 */
export enum Actions {
  // pool actions
  // liquidity actions
  INCREASE_LIQUIDITY = 0x00,
  DECREASE_LIQUIDITY = 0x01,
  MINT_POSITION = 0x02,
  BURN_POSITION = 0x03,

  // for fee on transfer tokens
  // INCREASE_LIQUIDITY_FROM_DELTAS = 0x04,
  // MINT_POSITION_FROM_DELTAS = 0x05,

  // swapping
  SWAP_EXACT_IN_SINGLE = 0x06,
  SWAP_EXACT_IN = 0x07,
  SWAP_EXACT_OUT_SINGLE = 0x08,
  SWAP_EXACT_OUT = 0x09,

  // closing deltas on the pool manager
  // settling
  SETTLE = 0x0b,
  SETTLE_ALL = 0x0c,
  SETTLE_PAIR = 0x0d,
  // taking
  TAKE = 0x0e,
  TAKE_ALL = 0x0f,
  TAKE_PORTION = 0x10,
  TAKE_PAIR = 0x11,

  CLOSE_CURRENCY = 0x12,
  // CLEAR_OR_TAKE = 0x13,
  SWEEP = 0x14,

  // for wrapping/unwrapping native
  // WRAP = 0x15,
  UNWRAP = 0x16,
}

// const POOL_KEY_STRUCT = '(address currency0,address currency1,uint24 fee,int24 tickSpacing,address hooks)'
export const POOL_KEY_STRUCT = [
    { name: "currency0", type: "address"},
    { name: "currency1", type: "address"},
    { name: "fee", type: "uint24"},
    { name: "tickSpacing", type: "int24"},
    { name: "hooks", type: "address"}
] as const;

// const PATH_KEY_STRUCT = '(address intermediateCurrency,uint256 fee,int24 tickSpacing,address hooks,bytes hookData)'
export const PATH_KEY_STRUCt = [
    { name: "intermediateCurrency", type: "address"},
    { name: "fee", type: "uint256"},
    { name: "tickSpacing", type: "int24"},
    { name: "hooks", type: "address"},
    { name: "hookData", type: "bytes"}
] as const

// const SWAP_EXACT_IN_SINGLE_STRUCT =
//   '(' + POOL_KEY_STRUCT + ' poolKey,bool zeroForOne,uint128 amountIn,uint128 amountOutMinimum,bytes hookData)'
export const SWAP_EXACT_IN_SINGLE_STRUCT = [
    { name: "poolKey", type: "tuple", internalType: "struct PoolKey", components: POOL_KEY_STRUCT },
    { name: "zeroForOne", type: "bool"},
    { name: "amountIn", type: "uint128"},
    { name: "amountOutMinimum", type: "uint128"},
    { name: "hookData", type: "bytes"}
] as const 

// const SWAP_EXACT_IN_STRUCT =
//   '(address currencyIn,' + PATH_KEY_STRUCT + '[] path,uint128 amountIn,uint128 amountOutMinimum)'
export const SWAP_EXACT_IN_STRUCT = [
    { name: "currencyIn", type: "address" },
    { name: "path", type: "tuple[]", internalType: "struct PathKey[]", components: PATH_KEY_STRUCt },
    { name: "amountIn", type: "uint128" },
    { name: "amountOutMinimum", type: "uint128"}
] as const

// const SWAP_EXACT_OUT_SINGLE_STRUCT =
//   '(' + POOL_KEY_STRUCT + ' poolKey,bool zeroForOne,uint128 amountOut,uint128 amountInMaximum,bytes hookData)'
export const SWAP_EXACT_OUT_SINGLE_STRUCT = [
    { name: "poolKey", type: "tuple", internalType: "struct PoolKey", components: POOL_KEY_STRUCT },
    { name: "zeroForOne", type: "bool"},
    { name: "amountOut", type: "uint128"},
    { name: "amountInMaximum", type: "uint128"},
    { name: "hookData", type: "bytes"}
] as const

// const SWAP_EXACT_OUT_STRUCT =
//   '(address currencyOut,' + PATH_KEY_STRUCT + '[] path,uint128 amountOut,uint128 amountInMaximum)'
export const SWAP_EXACT_OUT_STRUCT = [
    { name: "currencyOut", type: "address" },
    { name: "path", type: "tuple[]", internalType: "struct PathKey[]", components: PATH_KEY_STRUCt },
    { name: "amountOut", type: "uint128" },
    { name: "amountInMaximum", type: "uint128"}
] as const

export const V4_BASE_ACTIONS_ABI_DEFINITION = {
  // Liquidity commands
  [Actions.INCREASE_LIQUIDITY]: [
    { name: 'tokenId', type: 'uint256' },
    { name: 'liquidity', type: 'uint256' },
    { name: 'amount0Max', type: 'uint128' },
    { name: 'amount1Max', type: 'uint128' },
    { name: 'hookData', type: 'bytes' },
  ],
  [Actions.DECREASE_LIQUIDITY]: [
    { name: 'tokenId', type: 'uint256' },
    { name: 'liquidity', type: 'uint256' },
    { name: 'amount0Min', type: 'uint128' },
    { name: 'amount1Min', type: 'uint128' },
    { name: 'hookData', type: 'bytes' },
  ],
  [Actions.MINT_POSITION]: [
    { name: 'poolKey', type: "tuple", internalType: "struct PoolKey", components: POOL_KEY_STRUCT },
    { name: 'tickLower', type: 'int24' },
    { name: 'tickUpper', type: 'int24' },
    { name: 'liquidity', type: 'uint256' },
    { name: 'amount0Max', type: 'uint128' },
    { name: 'amount1Max', type: 'uint128' },
    { name: 'owner', type: 'address' },
    { name: 'hookData', type: 'bytes' },
  ],
  [Actions.BURN_POSITION]: [
    { name: 'tokenId', type: 'uint256' },
    { name: 'amount0Min', type: 'uint128' },
    { name: 'amount1Min', type: 'uint128' },
    { name: 'hookData', type: 'bytes' },
  ],

  // Swapping commands
  [Actions.SWAP_EXACT_IN_SINGLE]: SWAP_EXACT_IN_SINGLE_STRUCT,
  [Actions.SWAP_EXACT_IN]:  SWAP_EXACT_IN_STRUCT,
  [Actions.SWAP_EXACT_OUT_SINGLE]: SWAP_EXACT_OUT_SINGLE_STRUCT,
  [Actions.SWAP_EXACT_OUT]: SWAP_EXACT_OUT_STRUCT,

  // Payments commands
  [Actions.SETTLE]: [
    { name: 'currency', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'payerIsUser', type: 'bool' },
  ],
  [Actions.SETTLE_ALL]: [
    { name: 'currency', type: 'address' },
    { name: 'maxAmount', type: 'uint256' },
  ],
  [Actions.SETTLE_PAIR]: [
    { name: 'currency0', type: 'address' },
    { name: 'currency1', type: 'address' },
  ],
  [Actions.TAKE]: [
    { name: 'currency', type: 'address' },
    { name: 'recipient', type: 'address' },
    { name: 'amount', type: 'uint256' },
  ],
  [Actions.TAKE_ALL]: [
    { name: 'currency', type: 'address' },
    { name: 'minAmount', type: 'uint256' },
  ],
  [Actions.TAKE_PORTION]: [
    { name: 'currency', type: 'address' },
    { name: 'recipient', type: 'address' },
    { name: 'bips', type: 'uint256' },
  ],
  [Actions.TAKE_PAIR]: [
    { name: 'currency0', type: 'address' },
    { name: 'currency1', type: 'address' },
    { name: 'recipient', type: 'address' },
  ],
  [Actions.CLOSE_CURRENCY]: [{ name: 'currency', type: 'address' }],
  [Actions.SWEEP]: [
    { name: 'currency', type: 'address' },
    { name: 'recipient', type: 'address' },
  ],
  [Actions.UNWRAP]: [{ name: 'amount', type: 'uint256' }],
} as const

export class V4Planner {
  actions: Hex
  params: Hex[]

  constructor() {
    this.actions = "0x"
    this.params = []
  }

  addAction<T extends Actions>(type: T, parameters: AbiParametersToPrimitiveTypes<(typeof V4_BASE_ACTIONS_ABI_DEFINITION)[T]>): V4Planner {
    let command = createAction(type, parameters)
    this.params.push(command.encodedInput)
    this.actions = this.actions.concat(command.action.toString(16).padStart(2, '0')) as Hex
    return this
  }

  finalize(): Hex {
    return encodeAbiParameters([{ type: 'bytes' }, { type: "bytes[]"}], [this.actions, this.params])
  }
}

type RouterAction = {
  action: Actions
  encodedInput: Hex
}

function createAction<T extends Actions>(action: T, parameters: AbiParametersToPrimitiveTypes<(typeof V4_BASE_ACTIONS_ABI_DEFINITION)[T]>): RouterAction {
  const actionAbi = V4_BASE_ACTIONS_ABI_DEFINITION[action];
  const encodedInput = encodeAbiParameters(actionAbi, parameters as any)
  return { action, encodedInput }
}