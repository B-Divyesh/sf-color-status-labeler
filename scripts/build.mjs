import { execFileSync } from 'node:child_process';
import { closeSync, cpSync, mkdirSync, openSync, readSync, readdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
rmSync(resolve(root, 'dist'), { recursive: true, force: true });
rmSync(resolve(root, '.output'), { recursive: true, force: true });

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
execFileSync(npm, ['run', 'build:extension'], { cwd: root, stdio: 'inherit' });
execFileSync(npm, ['run', 'build:site:static'], { cwd: root, stdio: 'inherit' });

const output = resolve(root, '.output');
const archive = readdirSync(output).find((name) => name.endsWith('-chrome.zip'));
if (!archive) throw new Error('WXT did not produce a Chrome extension archive.');
const downloads = resolve(root, 'dist/site/downloads');
mkdirSync(downloads, { recursive: true });
cpSync(resolve(output, archive), resolve(downloads, 'color-status-labeler-chrome.zip'));
const packagedArchive = resolve(downloads, 'color-status-labeler-chrome.zip');
const descriptor = openSync(packagedArchive, 'r');
const signature = Buffer.alloc(4);
try {
  if (readSync(descriptor, signature, 0, signature.length, 0) !== signature.length || signature.toString('ascii') !== 'PK\u0003\u0004') {
    throw new Error('The packaged extension is not a valid ZIP archive.');
  }
} finally {
  closeSync(descriptor);
}
execFileSync('unzip', ['-tqq', packagedArchive], { stdio: 'inherit' });
console.log('Built deployable site and extension archive: dist/site');
