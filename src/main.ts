import * as fs from "fs";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import inputs from "./inputs";
import core from "@actions/core";

export function runImpl() {
    let vars = dotenv.parse(fs.readFileSync(inputs.envFile));
    if (inputs.expand) {
        // @ts-ignore
        vars = dotenvExpand({parsed: vars, ignoreProcessEnv: true}).parsed;
    }
    const applyResultFunc = inputs.export
        ? core.exportVariable
        : core.setOutput;

    Object.entries(vars).forEach(e => applyResultFunc(e[0], e[1]));
}