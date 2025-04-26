import { spawn } from 'child_process';
import { readFileSync } from 'fs';

const logo = readFileSync('./{path-to-logo}/logo.txt', 'utf8');
const mode: string = process.argv[2] || 'development';


const runCommand = (cmd: string, args: string[]) => {
    return new Promise<void>((resolve, reject) => {
        const child = spawn(cmd, args, { stdio: 'inherit', shell: true });
        child.on('close', (code: number) => {
            if (code !== 0) {
                reject(new Error(`${cmd} exited with code ${code}`));
            } else {
                resolve();
            }
        });
    });
};

/**
 * Builds the project in the specified mode using npm scripts.
 * 
 * @param mode - The mode in which to build the project. Can be 'development', 'test' or 'production'.
 */
export const buildProd = async (mode: string) => {
    console.log('\n🚀 Starting front end build process...');

    console.log('\n' + logo);

    console.log(`\n🛠️  Building the project in ${mode} mode`);

    console.log('\n🔍 Running type-check...');
    await runCommand('npm', ['run', 'type-check']);

    console.log(`\n🧱 Building the project with mode ${mode}...`);
    await runCommand('npm', ['run', 'build:only', '--', '--mode', mode]);

    // Uncomment the following lines if you want to generate the sitemap during build,
    // it requires the specific npm script in the repository.
    // console.log('\n🗺️ Generating sitemap...');
    // await runCommand('npm', [
    //     'run',
    //     'generate-sitemap:' + (mode === 'production' ? 'prod' : 'test'),
    // ]);
};


buildProd(mode).catch((err) => {
    console.error(err);
    process.exit(1);
});
