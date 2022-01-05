// @ts-check

/**
 * @name env
 * @type {{ENV_FILE: string, EXPAND: string}} env
 */

(() => {
    let vars = dotenv.parse(fs.readFileSync(env.ENV_FILE));
    if (env.EXPAND.toLowerCase() === 'true') {
        vars = dotenvExpand({parsed: vars, ignoreProcessEnv: true}).parsed;
    }
    Object.entries(vars).forEach(e => core.exportVariable(e[0], e[1]));
})()