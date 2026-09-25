// Service Worker der Gesangs-App – hält Programm und pdf.js offline bereit.
// Blätter und Notizen selbst liegen in IndexedDB (nicht hier).
const VERSION = '2.8.1-cef5ad0d';
const CACHE = 'gesangs-app-' + VERSION;
const PRECACHE = [
 "./",
 "index.html",
 "manifest.webmanifest",
 "icons/icon-192.png",
 "icons/icon-512.png",
 "icons/icon-maskable-512.png",
 "vendor/pdf-lib.min.js",
 "vendor/pdf.min.mjs",
 "vendor/pdf.worker.min.mjs",
 "vendor/standard_fonts/FoxitDingbats.pfb",
 "vendor/standard_fonts/FoxitFixed.pfb",
 "vendor/standard_fonts/FoxitFixedBold.pfb",
 "vendor/standard_fonts/FoxitFixedBoldItalic.pfb",
 "vendor/standard_fonts/FoxitFixedItalic.pfb",
 "vendor/standard_fonts/FoxitSerif.pfb",
 "vendor/standard_fonts/FoxitSerifBold.pfb",
 "vendor/standard_fonts/FoxitSerifBoldItalic.pfb",
 "vendor/standard_fonts/FoxitSerifItalic.pfb",
 "vendor/standard_fonts/FoxitSymbol.pfb",
 "vendor/standard_fonts/LiberationSans-Bold.ttf",
 "vendor/standard_fonts/LiberationSans-BoldItalic.ttf",
 "vendor/standard_fonts/LiberationSans-Italic.ttf",
 "vendor/standard_fonts/LiberationSans-Regular.ttf",
 "vendor/wasm/jbig2.wasm",
 "vendor/wasm/jbig2_nowasm_fallback.js",
 "vendor/wasm/openjpeg.wasm",
 "vendor/wasm/openjpeg_nowasm_fallback.js",
 "vendor/wasm/qcms_bg.wasm",
 "vendor/wasm/quickjs-eval.js",
 "vendor/wasm/quickjs-eval.wasm"
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(PRECACHE.map(async (u) => { try { await c.add(new Request(u, { cache: 'reload' })); } catch (err) { /* einzelne Datei nicht kritisch */ } }));
    self.skipWaiting();
  })());
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('gesangs-app-') && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;         // Google-Anfragen nie abfangen
  const isPage = req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
  if (isPage) {
    // Netz zuerst (damit Updates ankommen), bei Offline/Langsamkeit die gespeicherte Version
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      try {
        // cache:'no-store' statt req direkt weiterzureichen: manche Hosts/Browser liefern sonst
        // aus dem HTTP-Cache eine veraltete Seite aus, auch wenn der Service Worker selbst
        // schon "netzwerk zuerst" versucht (beobachtet als Update, das auf dem Handy ausblieb).
        const freshReq = new Request(req.url, { cache: 'no-store' });
        const res = await Promise.race([fetch(freshReq), new Promise((_, rej) => setTimeout(() => rej(new Error('slow')), 4000))]);
        if (res && res.ok) { c.put('index.html', res.clone()); }
        return res;
      } catch (err) {
        return (await c.match('index.html')) || (await c.match('./')) || Response.error();
      }
    })());
    return;
  }
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const hit = await c.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try { const res = await fetch(req); if (res && res.ok) c.put(req, res.clone()); return res; }
    catch (err) { return Response.error(); }
  })());
});
