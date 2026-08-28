import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
rmSync(resolve(root, 'dist'), { recursive: true, force: true });
rmSync(resolve(root, '.output'), { recursive: true, force: true });

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
execFileSync(npm, ['run', 'build:extension'], { cwd: root, stdio: 'inherit' });
execFileSync(npm, ['run', 'build:site'], { cwd: root, stdio: 'inherit' });

const output = resolve(root, '.output');
const archive = readdirSync(output).find((name) => name.endsWith('-chrome.zip'));
if (!archive) throw new Error('WXT did not produce a Chrome extension archive.');
const downloads = resolve(root, 'dist/site/downloads');
mkdirSync(downloads, { recursive: true });
cpSync(resolve(output, archive), resolve(downloads, 'color-status-labeler-chrome.zip'));
console.log('Built site and extension: dist/site');
