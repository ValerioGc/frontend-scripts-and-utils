import { spawn } from 'child_process';
import { readFileSync } from 'fs';
const logo = readFileSync('./{path-to-logo}/logo.txt', 'utf8');
const mode = process.argv[2] || 'development';
const runCommand = (cmd, args) => {
    return new Promise((resolve, reject) => {
        const child = spawn(cmd, args, { stdio: 'inherit', shell: true });
        child.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`${cmd} exited with code ${code}`));
            }
            else {
                resolve();
            }
        });
    });
};
export const buildProd = async (mode) => {
    console.log('\n🚀 Starting front end build process...');
    console.log('\n' + logo);
    console.log(`\n🛠️  Building the project in ${mode} mode`);
    console.log('\n🔍 Running type-check...');
    await runCommand('npm', ['run', 'type-check']);
    console.log(`\n🧱 Building the project with mode ${mode}...`);
    await runCommand('npm', ['run', 'build:only', '--', '--mode', mode]);
};
buildProd(mode).catch((err) => {
    console.error(err);
    process.exit(1);
});
