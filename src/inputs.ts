import * as core from '@actions/core';

export default {
    get envFile(): string {
        return core.getInput('envFile', {required: true});
    },

    get expand(): boolean {
        return core.getBooleanInput('expand');
    },

    get export(): boolean {
        return core.getBooleanInput('export');
    }
};