import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

const base = new URL(process.argv[2] ?? 'https://color-status-labeler.sociobot.in/');
const archiveUrl = new URL('/downloads/color-status-labeler-chrome.zip', base);
const homepageUrl = new URL('/', base);
const workerUrl = new URL('/sw.js', base);

function fail(message) {
  throw new Error(`Deployment verification failed: ${message}`);
}

function header(response, name) {
  return response.headers.get(name) ?? '';
}

const archive = await fetch(archiveUrl, { redirect: 'error', cache: 'no-store' });
if (!archive.ok) fail(`${archiveUrl} returned HTTP ${archive.status}, expected 200.`);
if (!/(?:application\/zip|application\/octet-stream|application\/x-zip-compressed)/iu.test(header(archive, 'content-type'))) {
  fail(`${archiveUrl} has unexpected Content-Type ${JSON.stringify(header(archive, 'content-type'))}.`);
}
if (!/attachment/iu.test(header(archive, 'content-disposition'))) {
  fail(`${archiveUrl} is missing an attachment Content-Disposition.`);
}
if (!/max-age=31536000/iu.test(header(archive, 'cache-control')) || !/immutable/iu.test(header(archive, 'cache-control'))) {
  fail(`${archiveUrl} is missing immutable archive caching.`);
}
const bytes = Buffer.from(await archive.arrayBuffer());
if (bytes.subarray(0, 4).toString('ascii') !== 'PK\u0003\u0004') fail(`${archiveUrl} did not begin with a ZIP signature.`);

const directory = mkdtempSync(resolve(tmpdir(), 'color-status-labeler-live-'));
const filename = resolve(directory, 'color-status-labeler-chrome.zip');
try {
  writeFileSync(filename, bytes);
  execFileSync('unzip', ['-tqq', filename], { stdio: 'inherit' });
  const manifest = JSON.parse(execFileSync('unzip', ['-p', filename, 'manifest.json'], { encoding: 'utf8' }));
  if (manifest.manifest_version !== 3 || manifest.name !== 'Color Status Labeler') {
    fail('downloaded archive is not the expected Manifest V3 Color Status Labeler package.');
  }
} finally {
  rmSync(directory, { recursive: true, force: true });
}

const [homepage, worker] = await Promise.all([
  fetch(homepageUrl, { redirect: 'error', cache: 'no-store' }),
  fetch(workerUrl, { redirect: 'error', cache: 'no-store' })
]);
if (!homepage.ok) fail(`${homepageUrl} returned HTTP ${homepage.status}.`);
if (!header(homepage, 'content-security-policy').includes("default-src 'self'")) fail('homepage is missing the self-only CSP.');
if (!header(homepage, 'permissions-policy').includes('geolocation=()')) fail('homepage is missing the restrictive Permissions Policy.');
if (!worker.ok || !/no-cache/iu.test(header(worker, 'cache-control'))) fail('service worker is not served with no-cache updates.');

console.log(`Verified live deployment: ${base.origin} (${bytes.length.toLocaleString()} byte extension ZIP)`);
