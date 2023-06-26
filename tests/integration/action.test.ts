import {RunTarget, RunOptions} from "github-action-ts-run-api";
import * as path from "path";

describe('export-env-action', () => {
    const target = process.env.CI
        ? RunTarget.mainJs('action.yml')
        : RunTarget.jsFile('lib/index.js', 'action.yml');

    it('should not export', async () => {
        const res = await target.run(RunOptions.create({
            inputs: {
                envFile: path.join(__dirname, 'case1.env'),
                export: 'false'
            },
            env: {
                JOBENV: 'abc'
            }
        }));
        expect(res.isSuccess).toEqual(true);
        expect(res.commands.outputs.AAA).toEqual('aaa#a');
        expect(res.commands.outputs.BBB).toEqual('val-${AAA}-lav');
        expect(res.commands.outputs.CCC).toEqual('${JOBENV}');
        expect(res.commands.exportedVars.AAA).toBeUndefined();
        expect(res.commands.exportedVars.BBB).toBeUndefined();
        expect(res.commands.exportedVars.CCC).toBeUndefined();
        expect(res.warnings).toHaveLength(0);
    });

    it('should not export, expandWithJobEnv', async () => {
        const res = await target.run(RunOptions.create({
            inputs: {
                envFile: path.join(__dirname, 'case1.env'),
                export: 'false',
                expandWithJobEnv: 'true'
            },
            env: {
                JOBENV: 'abc'
            }
        }));
        expect(res.isSuccess).toEqual(true);
        expect(res.commands.outputs.AAA).toEqual('aaa#a');
        expect(res.commands.outputs.BBB).toEqual('val-aaa#a-lav');
        expect(res.commands.outputs.CCC).toEqual('abc');
        expect(res.commands.exportedVars.AAA).toBeUndefined();
        expect(res.commands.exportedVars.BBB).toBeUndefined();
        expect(res.commands.exportedVars.CCC).toBeUndefined();
        expect(res.warnings).toHaveLength(0);
    });

    it('should not expand', async () => {
        const res = await target.run(RunOptions.create({
            inputs: {
                envFile: path.join(__dirname, 'case1.env'),
                expand: 'false'
            },
            env: {
                JOBENV: 'abc'
            }
        }));
        expect(res.isSuccess).toEqual(true);
        expect(res.commands.outputs.AAA).toBeUndefined();
        expect(res.commands.outputs.BBB).toBeUndefined();
        expect(res.commands.outputs.CCC).toBeUndefined();
        expect(res.commands.exportedVars.AAA).toEqual('aaa#a');
        expect(res.commands.exportedVars.BBB).toEqual('val-${AAA}-lav');
        expect(res.commands.exportedVars.CCC).toEqual('${JOBENV}');
        expect(res.warnings).toHaveLength(0);
    });

    it('should fail if file does not exist', async () => {
        const res = await target.run(RunOptions.create({
            inputs: {
                envFile: path.join(__dirname, 'case-non-existing.env'),
                expand: 'false'
            }
        }));
        expect(res.isSuccess).toEqual(false);
    });

    it('should expand and not export', async () => {
        const res = await target.run(RunOptions.create({
            inputs: {
                envFile: path.join(__dirname, 'case1.env'),
                export: 'false',
                expand: 'true'
            },
            env: {
                JOBENV: 'abc'
            }
        }));
        expect(res.isSuccess).toEqual(true);
        expect(res.commands.outputs.AAA).toEqual('aaa#a');
        expect(res.commands.outputs.BBB).toEqual('val-aaa#a-lav');
        expect(res.commands.outputs.CCC).toEqual('');
        expect(res.commands.exportedVars.AAA).toBeUndefined();
        expect(res.commands.exportedVars.BBB).toBeUndefined();
        expect(res.commands.exportedVars.CCC).toBeUndefined();
        expect(res.warnings).toHaveLength(0);
    });

    it('should expand and export', async () => {
        const res = await target.run(RunOptions.create({
            inputs: {
                envFile: path.join(__dirname, 'case1.env'),
                export: 'true',
                expand: 'true',
                expandWithJobEnv: 'true'
            },
            env: {
                JOBENV: 'abc'
            }
        }));
        expect(res.isSuccess).toEqual(true);
        expect(res.commands.outputs.AAA).toBeUndefined();
        expect(res.commands.outputs.BBB).toBeUndefined();
        expect(res.commands.outputs.CCC).toBeUndefined();
        expect(res.commands.exportedVars.AAA).toEqual('aaa#a');
        expect(res.commands.exportedVars.BBB).toEqual('val-aaa#a-lav');
        expect(res.commands.exportedVars.CCC).toEqual('abc');
        expect(res.warnings).toHaveLength(0);
    });

    it('should not parse json', async () => {
        const res = await target.run(RunOptions.create({
            inputs: {
                envFile: path.join(__dirname, 'invalid.env'),
            }
        }));
        expect(res.isSuccess).toEqual(true);
        expect(Object.keys(res.commands.outputs).length).toEqual(0);
        expect(Object.keys(res.commands.exportedVars).length).toEqual(0);
        expect(res.warnings).toHaveLength(0);
    });

    it('should mask', async () => {
        const res = await target.run(RunOptions.create({
            inputs: {
                envFile: path.join(__dirname, 'case1.env'),
                export: 'true',
                expand: 'true',
                expandWithJobEnv: 'true',
                mask: 'true'
            },
            env: {
                JOBENV: 'abc'
            }
        }));
        expect(res.isSuccess).toEqual(true);
        expect(res.commands.outputs.AAA).toBeUndefined();
        expect(res.commands.outputs.BBB).toBeUndefined();
        expect(res.commands.outputs.CCC).toBeUndefined();
        expect(res.commands.exportedVars.AAA).toEqual('aaa#a');
        expect(res.commands.exportedVars.BBB).toEqual('val-aaa#a-lav');
        expect(res.commands.exportedVars.CCC).toEqual('abc');
        expect(res.commands.secrets).toContain('aaa#a')
        expect(res.commands.secrets).toContain('val-aaa#a-lav')
        expect(res.commands.secrets).toContain('abc')
        expect(res.warnings).toHaveLength(0);
    });

    it('should process multiple files', async () => {
        const res = await target.run(RunOptions.create({
            inputs: {
                envFile: [path.join(__dirname, 'case1.env'), path.join(__dirname, 'case2.env')].join('|'),
                export: 'false',
                variables: 'AAA|BBB',
            },
            env: {
                JOBENV: 'abc'
            }
        }));
        expect(res.isSuccess).toEqual(true);
        expect(res.commands.outputs.AAA).toEqual('ddd#d');
        expect(res.commands.outputs.BBB).toEqual('val-${AAA}-lav');
        expect(res.commands.outputs.CCC).toBeUndefined();
        expect(res.commands.exportedVars.AAA).toBeUndefined();
        expect(res.commands.exportedVars.BBB).toBeUndefined();
        expect(res.commands.exportedVars.CCC).toBeUndefined();
        expect(res.warnings).toHaveLength(0);
    });

    it('should process multiple files with custom separator', async () => {
        const res = await target.run(RunOptions.create({
            inputs: {
                envFile: [path.join(__dirname, 'case1.env'), path.join(__dirname, 'case2.env')].join(';'),
                export: 'false',
                variables: 'AAA;BBB',
                separator: ';',
            },
            env: {
                JOBENV: 'abc'
            }
        }));
        expect(res.isSuccess).toEqual(true);
        expect(res.commands.outputs.AAA).toEqual('ddd#d');
        expect(res.commands.outputs.BBB).toEqual('val-${AAA}-lav');
        expect(res.commands.outputs.CCC).toBeUndefined();
        expect(res.commands.exportedVars.AAA).toBeUndefined();
        expect(res.commands.exportedVars.BBB).toBeUndefined();
        expect(res.commands.exportedVars.CCC).toBeUndefined();
        expect(res.warnings).toHaveLength(0);
    });

    it('should process multiple files with custom separator, specific values, expand with output (no export)', async () => {
        const res = await target.run(RunOptions.create({
            inputs: {
                envFile: [path.join(__dirname, 'case1.env'), path.join(__dirname, 'case2.env')].join(','),
                variables: 'AAA,BBB,EEE',
                separator: ',',
                export: 'false',
                expand: 'true',
                expandWithJobEnv: 'true',
                mask: 'true'
            },
            env: {
                JOBENV: 'abc'
            }
        }));
        expect(res.isSuccess).toEqual(true);
        expect(res.commands.outputs.AAA).toEqual('ddd#d');
        expect(res.commands.outputs.BBB).toEqual('val-ddd#d-lav');
        expect(res.commands.outputs.EEE).toEqual('val-111-expanded');
        expect(res.commands.outputs.CCC).toBeUndefined();
        expect(res.commands.outputs.DDD).toBeUndefined();
        expect(res.commands.exportedVars.AAA).toBeUndefined();
        expect(res.commands.exportedVars.BBB).toBeUndefined();
        expect(res.commands.exportedVars.EEE).toBeUndefined();
        expect(res.commands.exportedVars.CCC).toBeUndefined();
        expect(res.commands.exportedVars.DDD).toBeUndefined();
        expect(res.warnings).toHaveLength(0);
    });

    it('should process multiple files with custom separator, specific values, expand with export', async () => {
        const res = await target.run(RunOptions.create({
            inputs: {
                envFile: [path.join(__dirname, 'case1.env'), path.join(__dirname, 'case2.env')].join(','),
                variables: 'AAA,BBB,EEE',
                separator: ',',
                export: 'true',
                expand: 'true',
                expandWithJobEnv: 'true',
                mask: 'true'
            },
            env: {
                JOBENV: 'abc'
            }
        }));
        expect(res.isSuccess).toEqual(true);
        expect(res.commands.outputs.AAA).toBeUndefined();
        expect(res.commands.outputs.BBB).toBeUndefined();
        expect(res.commands.outputs.EEE).toBeUndefined();
        expect(res.commands.outputs.CCC).toBeUndefined();
        expect(res.commands.outputs.DDD).toBeUndefined();
        expect(res.commands.exportedVars.AAA).toEqual('ddd#d');
        expect(res.commands.exportedVars.BBB).toEqual('val-ddd#d-lav');
        expect(res.commands.exportedVars.EEE).toEqual('val-111-expanded');
        expect(res.commands.exportedVars.CCC).toBeUndefined();
        expect(res.commands.exportedVars.DDD).toBeUndefined();
        expect(res.warnings).toHaveLength(0);
    });
})
