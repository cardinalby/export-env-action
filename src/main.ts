import * as fs from "fs";
import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";
import inputs from "./inputs";
import * as core from "@actions/core";

function processValue(name: string, value: string) {
    if (inputs.mask) {
        core.setSecret(value)
    }

    if (inputs.export) {
        core.exportVariable(name, value)
    } else {
        core.setOutput(name, value)
    }
}

export function runImpl() {
    let vars = dotenv.parse(fs.readFileSync(inputs.envFile))
    if (inputs.expand || inputs.expandWithJobEnv) {
        // @ts-ignore
        vars = dotenvExpand.expand({parsed: vars, ignoreProcessEnv: !inputs.expandWithJobEnv}).parsed
    }

    Object.entries(vars).forEach(e => processValue(e[0], e[1]))
}
