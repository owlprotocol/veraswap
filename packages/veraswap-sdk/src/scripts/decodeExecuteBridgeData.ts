import { decodeFunctionData, Hex } from "viem";

import { executeBridgeAbi } from "../orbiter/executeBridgeAbi.js";
const data = process.argv[2] as Hex;

console.log(decodeFunctionData({ abi: [executeBridgeAbi], data }));
