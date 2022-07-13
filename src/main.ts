import * as fs from "fs";
import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";
import inputs from "./inputs";
import * as core from "@actions/core";

export function runImpl() {
    let vars = dotenv.parse(fs.readFileSync(inputs.envFile));
    if (inputs.expand || inputs.expandWithJobEnv) {
        // @ts-ignore
        vars = dotenvExpand.expand({parsed: vars, ignoreProcessEnv: !inputs.expandWithJobEnv}).parsed;
    }
    const applyResultFunc = inputs.export
        ? core.exportVariable
        : core.setOutput;

    Object.entries(vars).forEach(e => applyResultFunc(e[0], e[1]));
}
