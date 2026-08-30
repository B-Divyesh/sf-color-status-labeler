import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const base = new URL(process.argv[2] ?? 'https://color-status-labeler.sociobot.in/');
const archiveUrl = new URL('/downloads/color-status-labeler-chrome.zip', base);
const homepageUrl = new URL('/', base);
const workerUrl = new URL('/sw.js', base);
const notFoundUrl = new URL('/404', base);

function fail(message) {
  throw new Error(`Deployment verification failed: ${message}`);
}

function header(response, name) {
  return response.headers.get(name) ?? '';
}

const digest = (value) => createHash('sha256').update(value).digest('hex');

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
const localArchive = resolve('dist/site/downloads/color-status-labeler-chrome.zip');
if (existsSync(localArchive)) {
  const expected = readFileSync(localArchive);
  if (digest(bytes) !== digest(expected)) fail(`${archiveUrl} does not match the locally built release archive.`);
}

const directory = mkdtempSync(resolve(tmpdir(), 'color-status-labeler-live-'));
const filename = resolve(directory, 'color-status-labeler-chrome.zip');
try {
  writeFileSync(filename, bytes);
  execFileSync('unzip', ['-tqq', filename], { stdio: 'inherit' });
  const manifest = JSON.parse(execFileSync('unzip', ['-p', filename, 'manifest.json'], { encoding: 'utf8' }));
  if (manifest.manifest_version !== 3 || manifest.name !== 'Color Status Labeler') {
    fail('downloaded archive is not the expected Manifest V3 Color Status Labeler package.');
  }
  const unpacked = resolve(directory, 'unpacked');
  execFileSync('unzip', ['-q', filename, '-d', unpacked]);
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${unpacked}`, `--load-extension=${unpacked}`]
  });
  try {
    let [extensionWorker] = context.serviceWorkers();
    extensionWorker ??= await context.waitForEvent('serviceworker');
    const installed = await extensionWorker.evaluate(() => chrome.runtime.getManifest());
    if (installed.manifest_version !== 3 || installed.name !== 'Color Status Labeler') {
      fail('downloaded archive did not load as the expected extension in Chromium.');
    }
  } finally {
    await context.close();
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
if (!worker.ok || !/no-cache/iu.test(header(worker, 'cache-control')) || header(worker, 'service-worker-allowed') !== '/') {
  fail('service worker is not served with no-cache updates and root scope.');
}
const workerSource = await worker.text();
if (!workerSource.includes('self.skipWaiting()') || !workerSource.includes('self.clients.claim()')) {
  fail('service worker does not contain the immediate update activation path.');
}
const notFound = await fetch(notFoundUrl, { redirect: 'error', cache: 'no-store' });
if (notFound.status !== 404 || !(await notFound.text()).includes('This page is not here.')) {
  fail('/404 is not served as the styled 404 response with HTTP status 404.');
}

const siteRoot = resolve('dist/site');
if (existsSync(siteRoot)) {
  const identityFiles = [
    ['/', 'index.html'],
    ['/demo/', 'demo/index.html'],
    ['/privacy/', 'privacy/index.html'],
    ['/terms/', 'terms/index.html'],
    ['/404.html', '404.html'],
    ['/icon.svg', 'icon.svg'],
    ['/icon/apple-touch-icon.png', 'icon/apple-touch-icon.png'],
    ['/robots.txt', 'robots.txt'],
    ['/sitemap.xml', 'sitemap.xml'],
    ...readdirSync(resolve(siteRoot, 'assets')).map((name) => [`/assets/${name}`, `assets/${name}`])
  ];
  for (const [url, filename] of identityFiles) {
    const response = await fetch(new URL(url, base), { cache: 'no-store' });
    if (!response.ok) fail(`${url} returned HTTP ${response.status} during live identity verification.`);
    const live = Buffer.from(await response.arrayBuffer());
    if (digest(live) !== digest(readFileSync(resolve(siteRoot, filename)))) fail(`${url} does not match the locally built release file.`);
  }
  if (digest(workerSource) !== digest(readFileSync(resolve(siteRoot, 'sw.js')))) fail('/sw.js does not match the locally built release file.');
}

console.log(`Verified live deployment: ${base.origin} (${bytes.length.toLocaleString()} byte extension ZIP)`);
