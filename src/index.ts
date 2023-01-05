import * as core from '@actions/core';
import {runImpl} from "./main";

async function run(): Promise<void> {
    try {
        await runImpl()
    } catch (error) {
        core.setFailed(String(error))
    }
}

// noinspection JSIgnoredPromiseFromCall
run()