#!/usr/bin/env node
import { execSync } from 'child_process';
import { existsSync, statSync, unlinkSync } from 'fs';
import { readFileSync } from 'fs';

const logo = readFileSync('./{path-to-logo}/logo.txt', 'utf8');
const mode: string = process.argv[2];

function runCommand(command: string, log?: boolean): void {
    if (log == null || log != false) console.log(`\n⚗️  Running: ${command}\n`);
    execSync(command, { stdio: 'inherit' });
}


/**
 * Deployment script for the project.
 * This script automates the deployment process by checking out the appropriate branch,
 * merging changes from the main branch, and pushing the changes to the remote repository.
 * The names of the branches are hardcoded in the script. They can be changed to
 * match the naming conventions used in your project. It can display a logo if provided the ASCI logo path.
 * The steps are as follows:
    * 1. Check if the mode (test or prod) is specified.
    * 2. Check if there are any changes in the stash. If there are, exit the script.
    * 3. Change to the appropriate branch for deployment.
    * 4. Pull the latest changes from the remote repository.
    * 5. Merge the changes from the main branch into the deployment branch.
    * 6. Push the changes to the remote repository.
    * 7. Switch back to the main branch.
    * 8. Log the success message.
 */
export const deploy = (mode: string): void => {
    if (mode == null || (mode !== 'test' && mode !== 'prod')) {
        console.error('\n❌ Error: specify the type of deploy (test or prod).\n');
        process.exit(1);
    }

    console.log(`\n🚀 Starting the deployment process for ${mode}.\n`);

    if(logo !== null) 
        console.log('\n' + logo);

    runCommand('git stash list > stash.txt');
    if (existsSync('stash.txt')) {
        const size = statSync('stash.txt').size;
        if (size !== 0) {
            console.error(
                '\n❌ Error: there are changes in the stash. Clean the stash before proceeding.\n',
            );
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
    console.log(
        `\n❎  Pipeline deployment for ${mode} started, deployment completed successfully.\n`,
    );

    runCommand('git checkout main', false);
    console.log('\n🔄 Switched back to main branch.\n');
} 


// Execute the deployment function
try {
    deploy(mode);
} catch (error) {
    console.error('\n❌ Deployment failed: ', error + '\n');
    process.exit(1);
}