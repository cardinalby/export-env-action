[![test](https://github.com/cardinalby/export-env-action/actions/workflows/test.yml/badge.svg)](https://github.com/cardinalby/export-env-action/actions/workflows/test.yml)

## Export variables from .env file to job env

Can be useful if you want to use .env file as a storage of constants among 
multiple workflows.

## Examples

### Simple case:

```dotenv
# constants.env file

VAR1=abc
VAR2=def
```

```yaml
- uses: cardinalby/export-env-action@v2
  with:
    envFile: 'constants.env'    
  
# env.VAR1 == 'abc'
# env.VAR2 == 'def'
```

### Expand variables

```dotenv
# constants.env file

PROTOCOL=https
HOST=example.com
PORT=8080
URI=${PROTOCOL}://${HOST}:${PORT}
```

```yaml
- uses: cardinalby/export-env-action@v2
  with:
    envFile: 'constants.env'    
    expand: 'true'
  
# env.PROTOCOL == 'https'
# env.HOST == 'example.com'
# env.PORT == '8080'
# env.URI == 'https://example.com:8080'
```

### Do not export:

```dotenv
# constants.env file

VAR1=abc
VAR2=def
```

```yaml
- uses: cardinalby/export-env-action@v2
  id: exportStep
  with:
    envFile: 'constants.env'
    export: 'false'
  
# env.VAR1 == ''
# env.VAR2 == ''
# steps.exportStep.outputs.VAR1 == 'abc'
# steps.exportStep.outputs.VAR2 == 'def'
```

## Inputs

### 🔸 `envFile` Required
Path to env file to parse. 

### 🔹 `expand` Default: `false`
If `true`, "expands" variables:
```dotenv
VAR_1=aaa
VAR_2=${VAR_1}_bbb
```
Will lead to following exported variables: `VAR1 = aaa`, `VAR2 = aaa_bbb`.

Read more about expand engine rules [here](https://github.com/motdotla/dotenv-expand#what-rules-does-the-expansion-engine-follow).

### 🔹 `expandWithJobEnv` Default: `false`
If `true`, "expands" variables considering step (job) env variables (in addition to variables defined in the same env file). 
It means, `${GITHUB_RUN_ATTEMPT}` in a variable value will be substituted by the value of `$GITHUB_RUN_ATTEMPT` job env variable.

### 🔹 `export` Default: `true`
Export variables to a job environment. If `false`, all variables will be set as an action 
outputs instead.

### 🔹 `mask` Default: `false`
If `true` [masks](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#masking-a-value-in-log) all result values (after expanding) as secrets.

**Warning**: be cautious if you want to use this option, it is bad idea to store secrets in 
`.env` file in the repo, use [GitHub secrets](https://docs.github.com/en/codespaces/managing-codespaces-for-your-organization/managing-encrypted-secrets-for-your-repository-and-organization-for-github-codespaces) for that purpose.

## Outputs

If `export` is `false` then there are individual outputs for each variable from env file (where output name equals variable name).
