import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";
import { zeroHash } from "viem";

import { OrbiterBridgeSweep } from "../artifacts/OrbiterBridgeSweep.js";

// 07/05: 0x02edDaD0e4d136c4D5759151436EB633BBF9551F
export const ORBITER_BRIDGE_SWEEP_ADDRESS = getDeployDeterministicAddress({
    bytecode: OrbiterBridgeSweep.bytecode,
    salt: zeroHash,
});
