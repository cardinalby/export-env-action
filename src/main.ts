import * as fs from "fs";
import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";
import inputs from "./inputs";
import * as core from "@actions/core";

const DEFAULT_SEPARATOR = '|'

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

function readFile(name: string): dotenv.DotenvParseOutput {
    return dotenv.parse(fs.readFileSync(name))
}

function getVars(): dotenv.DotenvParseOutput {
    const files = inputs.envFile.split(DEFAULT_SEPARATOR)
    return files.reduce((accum, file) => ({
        ...accum,
        ...readFile(file)
    }), {})
}

function getFilter(): RegExp {
    try {
        return new RegExp(inputs.filter)
    } catch (err) {
        throw new Error("Invalid filter regex")
    }
}

export function runImpl() {
    let vars = getVars()
    if (inputs.expand || inputs.expandWithJobEnv) {
        vars = dotenvExpand.expand({parsed: vars, ignoreProcessEnv: !inputs.expandWithJobEnv}).parsed as dotenv.DotenvParseOutput
    }
    
    if (inputs.filter) {
        const criteria = getFilter()
        Object.entries(vars).forEach(([name, value]) => {
            if (criteria.test(name)) processValue(name, value)
        })
    } else {
        Object.entries(vars).forEach(e => processValue(e[0], e[1]))
    }
}
