import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { defineConfig } from 'vite';

const extensionArchiveUrl = process.env.CSL_EXTENSION_ARCHIVE_URL ?? '/downloads/color-status-labeler-chrome-unbuilt.zip';

if (!/^\/downloads\/color-status-labeler-chrome-(?:[a-f0-9]{16}|unbuilt)\.zip$/u.test(extensionArchiveUrl)) {
  throw new Error('CSL_EXTENSION_ARCHIVE_URL must be a content-addressed Color Status Labeler ZIP path.');
}

function filesIn(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesIn(path) : [path];
  });
}

function serviceWorkerSource(cacheName: string, shell: string[]) {
  return `const CACHE=${JSON.stringify(cacheName)};const SHELL=${JSON.stringify(shell)};self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==location.origin)return;if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).then(response=>response.ok?response:caches.match(event.request)).catch(()=>caches.match(event.request).then(hit=>hit||caches.match('/'))));return}event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{if(response.ok&&response.type==='basic'){const copy=response.clone();void caches.open(CACHE).then(cache=>cache.put(event.request,copy))}return response}).catch(()=>caches.match('/'))))})`;
}

export default defineConfig({
  root: resolve(import.meta.dirname),
  publicDir: resolve(import.meta.dirname, 'public'),
  build: {
    outDir: resolve(import.meta.dirname, '../dist/site'),
    emptyOutDir: true,
    target: 'es2022',
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        demo: resolve(import.meta.dirname, 'demo/index.html'),
        privacy: resolve(import.meta.dirname, 'privacy/index.html'),
        terms: resolve(import.meta.dirname, 'terms/index.html'),
        notFound: resolve(import.meta.dirname, '404.html')
      },
      output: {
        entryFileNames: 'assets/immutable/[name]-[hash].js',
        chunkFileNames: 'assets/immutable/[name]-[hash].js',
        assetFileNames: 'assets/immutable/[name]-[hash][extname]'
      }
    }
  },
  plugins: [{
    name: 'release-download-link',
    transformIndexHtml(html) {
      return html.replaceAll('__CSL_EXTENSION_ARCHIVE_URL__', extensionArchiveUrl);
    }
  }, {
    name: 'offline-shell',
    writeBundle(options) {
      const outDir = options.dir;
      if (!outDir) throw new Error('Site build must write to a directory.');
      const assets = filesIn(resolve(outDir, 'assets'))
        .map((file) => `/${relative(outDir, file).replaceAll('\\', '/')}`)
        .sort();
      const shell = ['/', '/demo/', '/privacy/', '/terms/', '/404.html', '/icon.svg', '/robots.txt', '/sitemap.xml', ...assets];
      const revision = createHash('sha256')
        .update([
          `extension:${extensionArchiveUrl}`,
          ...shell.map((url) => {
            const file = url === '/' ? 'index.html' : url.endsWith('/') ? `${url.slice(1)}index.html` : url.slice(1);
            return `${url}:${readFileSync(resolve(outDir, file))}`;
          })
        ].join('|'))
        .digest('hex')
        .slice(0, 12);
      writeFileSync(resolve(outDir, 'sw.js'), serviceWorkerSource(`csl-site-${revision}`, shell));
    }
  }]
});
