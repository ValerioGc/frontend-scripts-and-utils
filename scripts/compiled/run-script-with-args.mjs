#!/usr/bin/env node
import { execSync } from 'child_process';
import os from 'os';
const mode = process.argv[2] || '{default-mode}';
const isWindows = os.platform() === 'win32';
const scriptName = isWindows ? '{script-filename}_' + mode + '.bat' : '{script-filename}_' + mode + '.sh';
const scriptPath = `./{script-path}/${scriptName}`;
console.log(`⚙️ Running ${scriptPath} on ${isWindows ? 'Windows' : 'Unix-like OS'} in ${mode} mode`);
try {
    execSync(`${scriptPath} ${mode}`, { stdio: 'inherit' });
}
catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
}
finally {
    console.log('✅ Deployment script finished.');
}
