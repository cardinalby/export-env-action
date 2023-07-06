[![test](https://github.com/cardinalby/export-env-action/actions/workflows/test.yml/badge.svg)](https://github.com/cardinalby/export-env-action/actions/workflows/test.yml)

# Table of contents

1. [Export variables from .env file to job env](#export_variables_from_env)
1. [Examples](#examples)
    1. [Simple case](#examples_simple_case)
    1. [Multiple environment files](#examples_multiple_environment)
    1. [Specify variables filter](#examples_specify_variables_filter)
    1. [Expand variables](#examples_expand_variables)
    1. [Do not export](#examples_do_not_export)
1. [Inputs](#inputs)
    1. [envFile](#inputs_env_file)
    1. [filter](#inputs_filter)
    1. [expand](#inputs_expand)
    1. [expandWithJobEnv](#inputs_expand_with_job_env)
    1. [export](#inputs_export)
    1. [mask](#inputs_mask)
1. [Outputs](#outputs)


<a name="export_variables_from_env"></a>

## Export variables from .env file to job env

Can be useful if you want to use .env file as a storage of constants among 
multiple workflows.

<a name="examples"></a>

## Examples

<a name="examples_simple_case"></a>

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

<a name="examples_multiple_environment"></a>

### Multiple environment files:

```dotenv
# constants1.env file

VAR1=abc
VAR2=def
```

```dotenv
# constants2.env file

VAR2=ghi
VAR3=jkl
```

```yaml
- uses: cardinalby/export-env-action@v2
  with:
    envFile: 'constants1.env|constants2.env'
  
# env.VAR1 == 'abc'
# env.VAR2 == 'ghi'
# env.VAR3 == 'jkl'
```

<a name="examples_specify_variables_filter"></a>

### Specify variables filter:

```dotenv
# constants.env file

VAR1=abc
VAR2=def
VAR3=ghi
```

```yaml
- uses: cardinalby/export-env-action@v2
  with:
    envFile: 'constants.env'
    filter: 'VAR1|VAR3'
  
# env.VAR1 == 'abc'
# env.VAR3 == 'jkl'
```

<a name="examples_expand_variables"></a>

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

<a name="examples_do_not_export"></a>

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

<a name="inputs"></a>

## Inputs

<a name="inputs_env_file"></a>

### 🔸 `envFile` Required
Path to env file to parse. 

<a name="inputs_filter"></a>

### 🔹 `filter` Default: null
Filter regexp to only export specific variables matching the filter. 

It *filters* both <ins>exported variables</ins> and <ins>action outputs</ins> (if `export: false`), but doesn't impacts variables extending and masking.

If filter is: 'VAR_1|VAR_3'
```dotenv
VAR_1=aaa
VAR_2=bbb
VAR_3=ccc
```
Will lead to following exported variables: `VAR_1 = aaa`, `VAR3 = ccc`.

<a name="inputs_expand"></a>

### 🔹 `expand` Default: `false`
If `true`, "expands" variables:
```dotenv
VAR_1=aaa
VAR_2=${VAR_1}_bbb
```
Will lead to following exported variables: `VAR1 = aaa`, `VAR2 = aaa_bbb`.

Read more about expand engine rules [here](https://github.com/motdotla/dotenv-expand#what-rules-does-the-expansion-engine-follow).

<a name="inputs_expand_with_job_env"></a>

### 🔹 `expandWithJobEnv` Default: `false`
If `true`, "expands" variables considering step (job) env variables (in addition to variables defined in the same env file). 
It means, `${GITHUB_RUN_ATTEMPT}` in a variable value will be substituted by the value of `$GITHUB_RUN_ATTEMPT` job env variable.

<a name="inputs_export"></a>

### 🔹 `export` Default: `true`
Export variables to a job environment. If `false`, all variables will be set as an action 
outputs instead.

<a name="inputs_mask"></a>

### 🔹 `mask` Default: `false`
If `true` [masks](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#masking-a-value-in-log) all result values (after expanding) as secrets.

**Warning**: be cautious if you want to use this option, it is bad idea to store secrets in 
`.env` file in the repo, use [GitHub secrets](https://docs.github.com/en/codespaces/managing-codespaces-for-your-organization/managing-encrypted-secrets-for-your-repository-and-organization-for-github-codespaces) for that purpose.

<a name="outputs"></a>

## Outputs

If `export` is `false` then there are individual outputs for each variable from env file (where output name equals variable name).
