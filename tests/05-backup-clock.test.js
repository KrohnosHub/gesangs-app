// Uhr-Korrektur und automatische Drive-Sicherung (v2.24.0) – mit einem kleinen In-Memory-«Drive»
const { launch, open } = require('./fixture.js');
const FAKE_DRIVE = () => {
  const FD = window.__fd = { files: {}, n: 0 };
  const mk = (o) => new Response(JSON.stringify(o), { status: 200, headers: { 'content-type': 'application/json' } });
  const now = () => new Date().toISOString();
  window.driveFetch = async (url, opts = {}) => {
    const u = new URL(url), method = opts.method || 'GET', p = u.pathname;
    if (p.includes('/upload/')) {
      if (method === 'POST') {
        const body = opts.body; const meta = JSON.parse(body.match(/charset=UTF-8\r\n\r\n([\s\S]*?)\r\n--/)[1]);
        const content = body.match(/Content-Type: application\/json\r\n\r\n([\s\S]*)\r\n--[^\r\n]*--$/)[1];
        const id = 'F' + (++FD.n); FD.files[id] = { id, name: meta.name, parents: meta.parents, mimeType: meta.mimeType, content, trashed: false, modifiedTime: now() }; return mk({ id, modifiedTime: FD.files[id].modifiedTime });
      }
      const id = p.split('/').pop(); FD.files[id].content = opts.body; FD.files[id].modifiedTime = now(); return mk({ id, modifiedTime: FD.files[id].modifiedTime });
    }
    if (/\/files$/.test(p)) {
      if (method === 'POST') { const m = JSON.parse(opts.body); const id = 'F' + (++FD.n); FD.files[id] = Object.assign({ id, trashed: false, modifiedTime: now() }, m); return mk({ id }); }
      const q = decodeURIComponent(u.searchParams.get('q') || ''); const par = (q.match(/'([^']+)' in parents/) || [])[1];
      const nm = (q.match(/name='([^']+)'/) || [])[1], has = (q.match(/name contains '([^']+)'/) || [])[1], folder = /vnd.google-apps.folder/.test(q);
      const res = Object.values(FD.files).filter(f => !f.trashed && (!par || (f.parents || []).includes(par)) && (!nm || f.name === nm) && (!has || f.name.includes(has)) && (!folder || f.mimeType === 'application/vnd.google-apps.folder'));
      return mk({ files: res });
    }
    const id = p.split('/').pop(); const f = FD.files[id];
    if (!f) return new Response('{}', { status: 404 });
    if (method === 'PATCH') { Object.assign(f, JSON.parse(opts.body)); return mk(f); }
    if (u.searchParams.get('alt') === 'media') return new Response(f.content, { status: 200 });
    return mk(f);
  };
  accessToken = 'x'; tokenExpiry = Date.now() + 3e6; folderId = 'ROOT';
};
module.exports = async () => {
  const { test, eq, ok } = T;
  const b = await launch(); const D = { width: 1280, height: 800 };
  try {
    await test('Uhr-Korrektur: Abweichung wird gemessen, geglättet und auf Zeitstempel angewendet', async () => {
      const pg = await open(b, D, { logs: false });
      const r = await pg.evaluate(() => {
        const out = {};
        for (let i = 0; i < 3; i++) { const t = Date.now(); noteServerTime(t + 5000, t - 100, t + 100); }   // +5 s: über der Toleranz
        out.small = clockSkew;
        clockSkew = 0; skewSamples.length = 0;
        for (let i = 0; i < 5; i++) { const t = Date.now(); noteServerTime(t - 600000, t - 100, t + 100); }  // Gerät geht 10 min vor
        out.skew = clockSkew; fset('zz', {}); out.stamp = lib.files.zz.u - Date.now();
        const t = Date.now(); noteServerTime(t + 90000, t - 100, t + 100); out.robust = clockSkew;            // Ausreisser ändert den Median nicht
        clockSkew = 0; skewSamples.length = 0; const t2 = Date.now(); noteServerTime(t2 + 500, t2 - 100, t2 + 100); out.tiny = clockSkew;
        return out;
      });
      ok(r.small > 4000 && r.small < 6000, 'kleine Abweichung ' + r.small);
      ok(Math.abs(r.skew + 600000) < 500, 'skew ' + r.skew);
      ok(Math.abs(r.stamp + 600000) < 500, 'Zeitstempel ' + r.stamp);
      ok(Math.abs(r.robust + 600000) < 500, 'Median robust ' + r.robust);
      eq(r.tiny, 0, 'unter 4 s ignoriert'); await pg.context().close();
    });
    await test('Automatische Sicherung: einmal täglich, Ordner «Backups», nur die letzten 7', async () => {
      const pg = await open(b, D, { logs: false });
      await pg.evaluate(FAKE_DRIVE);
      eq(await pg.evaluate(() => autoBackup()), true, 'erste Sicherung');
      eq(await pg.evaluate(() => autoBackup()), false, 'am selben Tag nicht nochmal');
      let r = await pg.evaluate(() => Object.values(__fd.files).map(f => [f.name, f.parents && f.parents[0] === 'ROOT', f.mimeType === 'application/json']));
      ok(r.some(x => x[0] === 'Backups' && x[1]), 'Ordner Backups unter dem App-Ordner');
      const day = await pg.evaluate(() => new Date(nowTs()).toLocaleDateString('sv-SE'));
      const bk = await pg.evaluate(() => { const f = Object.values(__fd.files).find(x => /^library-/.test(x.name)); const o = JSON.parse(f.content); return [f.name, Object.keys(o.lib.songs).length, o.v]; });
      eq(bk[0], 'library-' + day + '.json'); eq(bk[1], 3, 'Songs in der Sicherung');
      await pg.evaluate(() => { const bid = Object.values(__fd.files).find(f => f.name === 'Backups').id; for (let i = 1; i <= 9; i++) { const id = 'O' + i; __fd.files[id] = { id, name: 'library-2026-09-0' + i + '.json', parents: [bid], mimeType: 'application/json', content: '{}', trashed: false }; } lsSet('gapp_lastbackup', 'alt'); });
      eq(await pg.evaluate(() => autoBackup()), true, 'nächster Tag');
      const alive = await pg.evaluate(() => Object.values(__fd.files).filter(f => /^library-/.test(f.name) && !f.trashed).length);
      eq(alive, 7, 'nur 7 behalten'); eq(await pg.evaluate(() => (listBackups(), 1)), 1);
      await pg.context().close();
    });
    await test('Aus Sicherung zurückholen: Stand zurück, Gelöschtes kommt wieder, Neues bleibt', async () => {
      const pg = await open(b, D, { logs: false });
      const r = await pg.evaluate(() => {
        const B = { lib: JSON.parse(JSON.stringify(lib)) };
        lib.songs.s1.n = 'Verändert'; lib.songs.s2.d = 1; lib.songs.neu = { n: 'Neu', f: null, sheets: [], tg: [], fv: 0, u: 1, audio: [], links: [] };
        const n = restoreFromLibBackup(B);
        return { n, s1: lib.songs.s1.n, s2d: lib.songs.s2.d || 0, neu: !!lib.songs.neu, libDirty };
      });
      eq([r.s1, r.s2d, r.neu, r.libDirty], ['Sound of Silence', 0, true, true]); ok(r.n >= 2, 'Anzahl ' + r.n);
      await pg.context().close();
    });
  } finally { await b.close(); }
};
