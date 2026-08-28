import { resolve } from 'node:path';
import { defineConfig } from 'vite';

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
        privacy: resolve(import.meta.dirname, 'privacy/index.html'),
        terms: resolve(import.meta.dirname, 'terms/index.html')
      }
    }
  },
  plugins: [{
    name: 'offline-shell',
    generateBundle(_options, bundle) {
      const urls = ['/', '/privacy/', '/terms/', '/icon.svg', '/assets/cassette-signal-hero-768.webp', '/assets/cassette-signal-hero-1280.webp', ...Object.keys(bundle).map((file) => `/${file}`)];
      const source = `const CACHE='csl-site-v1';const SHELL=${JSON.stringify(urls)};self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return response}).catch(()=>caches.match('/'))))})`;
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    }
  }]
});
