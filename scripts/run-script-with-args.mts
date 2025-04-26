#!/usr/bin/env node

import { execSync } from 'child_process';
import os from 'os';

// This script is used to run a deployment script based on the operating system and mode.
// It checks if the operating system is Windows or Unix-like and runs the appropriate script.
// It also reads the mode from command line arguments or defaults to 'production'.
// The script uses the execSync function to execute the command synchronously.
// It logs the output to the console and handles any errors that may occur during execution.


// Read the mode from command line arguments or default to 'production'
// Change the {default-mode} with the default mode you want to use
const mode: string = process.argv[2] || '{default-mode}';

// Check if the operating system is Windows
const isWindows = os.platform() === 'win32';

// Change the {script-filename} with the name of the script you want to run 
const scriptName = isWindows ? '{script-filename}_' + mode + '.bat' : '{script-filename}_' + mode + '.sh';

// Change the {script-path} with the path to the script
const scriptPath = `./{script-path}/${scriptName}`;

console.log(
    `⚙️ Running ${scriptPath} on ${isWindows ? 'Windows' : 'Unix-like OS'} in ${mode} mode`,
);

try {
    execSync(`${scriptPath} ${mode}`, { stdio: 'inherit' });
} catch (error: unknown) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
} finally {
    console.log('✅ Deployment script finished.');
}
