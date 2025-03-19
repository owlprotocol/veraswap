import { buildLib, cjsLibConfig, esmLibConfig } from "@owlprotocol/esbuild-config";
import ignoretestsPlugin from "esbuild-plugin-ignoretests";

// Conflicts with forge libraries
cjsLibConfig.outdir = "_cjs/lib";
esmLibConfig.outdir = "_esm/lib";
cjsLibConfig.plugins = [ignoretestsPlugin(), ...cjsLibConfig.plugins];
esmLibConfig.plugins = [ignoretestsPlugin(), ...esmLibConfig.plugins];

await buildLib({});
