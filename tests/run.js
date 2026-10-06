#!/usr/bin/env node
// Gesangs-App Testsuite: `node tests/run.js [Filter]`  (siehe README, Abschnitt «Tests»)
// Startet einen eigenen statischen Server, führt alle tests/*.test.js aus und gibt eine Zusammenfassung aus.
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.wasm': 'application/wasm', '.woff2': 'font/woff2', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.css': 'text/css' };
const srv = http.createServer((q, r) => {
  const p = path.join(root, decodeURIComponent(q.url.split('?')[0]).replace(/^\/$/, '/index.html'));
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(r);
});
const results = { pass: 0, fail: 0, failed: [] };
global.T = {
  async test(name, fn) {
    const t0 = Date.now();
    try { await fn(); results.pass++; console.log('  ✓ ' + name + ' (' + (Date.now() - t0) + ' ms)'); }
    catch (e) { results.fail++; results.failed.push(name); console.log('  ✗ ' + name + '\n      ' + String(e.message).split('\n').join('\n      ')); }
  },
  eq(a, b, msg) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error((msg || 'eq') + ': erwartet ' + JSON.stringify(b) + ', war ' + JSON.stringify(a)); },
  ok(c, msg) { if (!c) throw new Error(msg || 'Bedingung nicht erfüllt'); },
  root,
};
(async () => {
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  process.env.BASE = 'http://127.0.0.1:' + srv.address().port + '/index.html';
  const filter = process.argv[2] || '';
  const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.test.js') && f.includes(filter)).sort();
  for (const f of files) { console.log('\n' + f); try { await require('./' + f)(); } catch (e) { results.fail++; results.failed.push(f); console.log('  ✗ ' + f + ' abgebrochen: ' + e.message); } }
  console.log('\n' + results.pass + ' bestanden, ' + results.fail + ' fehlgeschlagen' + (results.fail ? ': ' + results.failed.join('; ') : ''));
  srv.close(); process.exit(results.fail ? 1 : 0);
})();
