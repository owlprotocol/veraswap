import { buildLib, cjsLibConfig, esmLibConfig } from "@owlprotocol/esbuild-config";

// Conflicts with forge libraries
cjsLibConfig.outdir = "_cjs/lib"
esmLibConfig.outdir = "_esm/lib"

await buildLib();
