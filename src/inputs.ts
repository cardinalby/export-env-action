import * as core from '@actions/core';

export default {
    get envFile(): string {
        return core.getInput('envFile', {required: true})
    },

    get variables(): string {
        return core.getInput('variables')
    },

    get separator(): string {
        return core.getInput('separator')
    },

    get expand(): boolean {
        return core.getBooleanInput('expand')
    },

    get expandWithJobEnv(): boolean {
        return core.getBooleanInput('expandWithJobEnv')
    },

    get export(): boolean {
        return core.getBooleanInput('export')
    },

    get mask(): boolean {
        return core.getBooleanInput('mask')
    }
}