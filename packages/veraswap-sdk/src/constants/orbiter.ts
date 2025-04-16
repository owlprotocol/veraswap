import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";
import { zeroHash } from "viem";

import { OrbiterBridgeSweep } from "../artifacts/OrbiterBridgeSweep.js";

export const ORBITER_BRIDGE_SWEEP_ADDRESS = getDeployDeterministicAddress({
    bytecode: OrbiterBridgeSweep.bytecode,
    salt: zeroHash,
});
