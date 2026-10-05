// Statische Invarianten: CSP-Hashes, Service-Worker-Version, Konfiguration, Dateien
const fs = require('fs'), path = require('path'), crypto = require('crypto');
module.exports = async () => {
  const { test, eq, ok, root } = T;
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const ver = (html.match(/APP_VERSION\s*=\s*'([^']+)'/) || [])[1];
  await test('APP_VERSION vorhanden und im README dokumentiert', () => {
    ok(ver, 'APP_VERSION fehlt');
    ok(fs.readFileSync(path.join(root, 'README.md'), 'utf8').includes('v' + ver), 'README ohne Eintrag v' + ver);
  });
  await test('CSP-Hashes passen zu allen Inline-Skripten', () => {
    const csp = (html.match(/Content-Security-Policy"[^>]*content="([^"]+)"/) || [])[1] || '';
    const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
    ok(scripts.length >= 2, 'weniger als 2 Inline-Skripte');
    scripts.forEach((s, i) => { const h = 'sha256-' + crypto.createHash('sha256').update(s, 'utf8').digest('base64'); ok(csp.includes(h), 'Hash von Inline-Skript ' + (i + 1) + ' fehlt in der CSP (App startet sonst nicht)'); });
  });
  await test('sw.js VERSION = APP_VERSION + md5(index.html)', () => {
    const v = (sw.match(/VERSION\s*=\s*'([^']+)'/) || [])[1];
    const md5 = crypto.createHash('md5').update(fs.readFileSync(path.join(root, 'index.html'))).digest('hex').slice(0, 8);
    eq(v, ver + '-' + md5, 'sw VERSION (finalize.py vergessen?)');
  });
  await test('Pflichtdateien vorhanden', () => { ['manifest.webmanifest', 'sw.js', 'README.md'].forEach(f => ok(fs.existsSync(path.join(root, f)), f + ' fehlt')); });
  await test('Keine Geheimnisse im Code (Spotify-Secret/Token-Muster)', () => {
    ok(!/AIza[0-9A-Za-z_-]{30,}/.test(html) || /YOUTUBE_API_KEY/.test(html), 'API-Key-Muster ausserhalb CONFIG');
    ok(!/client_secret['"]?\s*[:=]\s*['"][0-9a-f]{20,}/i.test(html), 'Client-Secret im Code');
  });
};
