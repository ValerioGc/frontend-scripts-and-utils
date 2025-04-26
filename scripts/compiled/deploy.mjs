#!/usr/bin/env node
import { execSync } from 'child_process';
import { existsSync, statSync, unlinkSync } from 'fs';
import { readFileSync } from 'fs';
const logo = readFileSync('./{path-to-logo}/logo.txt', 'utf8');
const mode = process.argv[2];
function runCommand(command, log) {
    if (log == null || log != false)
        console.log(`\n⚗️  Running: ${command}\n`);
    execSync(command, { stdio: 'inherit' });
}
export const deploy = (mode) => {
    if (mode == null || (mode !== 'test' && mode !== 'prod')) {
        console.error('\n❌ Error: specify the type of deploy (test or prod).\n');
        process.exit(1);
    }
    console.log(`\n🚀 Starting the deployment process for ${mode}.\n`);
    if (logo !== null)
        console.log('\n' + logo);
    runCommand('git stash list > stash.txt');
    if (existsSync('stash.txt')) {
        const size = statSync('stash.txt').size;
        if (size !== 0) {
            console.error('\n❌ Error: there are changes in the stash. Clean the stash before proceeding.\n');
            unlinkSync('stash.txt');
            process.exit(1);
        }
        unlinkSync('stash.txt');
    }
    console.log(`\n⚙️  Branch change to deploy_${mode}`);
    runCommand(`git checkout deploy_${mode}`);
    runCommand('git pull');
    console.log(`\n⚙️  Merge branch origin/main into deploy_${mode}`);
    runCommand(`git merge origin/main --no-ff -X theirs -m "Deploy ${mode}"`);
    runCommand('git push');
    console.log(`\n❎  Pipeline deployment for ${mode} started, deployment completed successfully.\n`);
    runCommand('git checkout main', false);
    console.log('\n🔄 Switched back to main branch.\n');
};
try {
    deploy(mode);
}
catch (error) {
    console.error('\n❌ Deployment failed: ', error + '\n');
    process.exit(1);
}
