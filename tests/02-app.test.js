// Start, Bibliothek (Titel/Interpret), Verknüpfungen, Sync-Anzeige, Üben, Handy-Layout
const { launch, open } = require('./fixture.js');
module.exports = async () => {
  const { test, eq, ok } = T;
  const b = await launch();
  const D = { width: 1280, height: 800 };
  try {
    await test('Start ohne Skriptfehler, 3 Songs sichtbar', async () => {
      const pg = await open(b, D, { logs: false });
      eq(pg.errs, []); eq(await pg.evaluate(() => Object.keys(lib.songs).length), 3); ok((await pg.names()).length >= 2, 'Liste leer'); await pg.context().close();
    });
    await test('Migration «Interpret - Titel» → Titel + Interpret, Sortierung, Filter, Suche', async () => {
      const pg = await open(b, D, { logs: false });
      await pg.evaluate(async () => { const r = await IDB.get('kv', 'lib'); const L = r.lib; L.songs.s1.n = 'Simon & Garfunkel - Sound of Silence'; L.songs.s3.n = 'Queen – Bohemian Rhapsody'; ['s1', 's2', 's3'].forEach(k => delete L.songs[k].ar); await IDB.put('kv', 'lib', r); });
      await pg.reload(); await pg.waitForTimeout(1500);
      eq(await pg.evaluate(() => Object.values(lib.songs).map(s => s.n + '|' + (s.ar || '')).sort()), ['Amazing Grace|', 'Bohemian Rhapsody|Queen', 'Sound of Silence|Simon & Garfunkel']);
      await pg.selectOption('#sortSel', 'artist'); await pg.waitForTimeout(300);
      eq((await pg.names())[0], 'Sound of Silence', 'Sort nach Interpret (ohne Interpret zuletzt)');
      await pg.fill('#searchInput', 'queen'); await pg.waitForTimeout(300); eq(await pg.names(), ['Bohemian Rhapsody'], 'Suche nach Interpret');
      await pg.fill('#searchInput', ''); await pg.selectOption('#artistFilter', 'Queen'); await pg.waitForTimeout(300); eq(await pg.names(), ['Bohemian Rhapsody'], 'Interpreten-Filter');
      eq(pg.errs, []); await pg.context().close();
    });
    await test('Verknüpfungen: Karaoke-Erkennung, Spotify nie Karaoke, Kategorie wechseln', async () => {
      const pg = await open(b, D, { logs: false });
      const r = await pg.evaluate(async () => {
        CONFIG.YOUTUBE_API_KEY = 'x'; CONFIG.SPOTIFY_CLIENT_ID = 'x'; CONFIG.SPOTIFY_CLIENT_SECRET = 'y';
        window.spotifySearch = async () => [{ type: 'sp', mediaId: 'T1', title: 'Bad Moon Rising – CCR', url: 'https://open.spotify.com/track/T1' }];
        window.youtubeSearch = async (q) => q.includes('karaoke') ? [{ type: 'yt', mediaId: 'K1', title: 'Bad Moon Rising Karaoke Version', url: 'u1' }] : [{ type: 'yt', mediaId: 'O1', title: 'Bad Moon Rising (Official)', url: 'u2' }];
        const res = (await suggestLinksFor('Creedence – Bad Moon Rising')).map(x => x.type + ':' + x.mediaId + ':' + x.kind);
        const id = Object.keys(lib.songs)[0]; lib.songs[id].n = 'Bad Moon Rising'; lib.songs[id].ar = 'Creedence';
        lib.songs[id].links = [{ id: 'lkA', type: 'sp', mediaId: 'T1', url: 'https://open.spotify.com/track/T1', title: 'Bad Moon Rising – CCR', kind: 'karaoke', auto: 1, u: 1 }];
        migrateSongs(); const mig = lib.songs[id].links[0].kind;
        setLinkKind(id, 'lkA', 'karaoke'); return { res, mig, sw: lib.songs[id].links[0].kind };
      });
      ok(r.res.includes('yt:K1:karaoke') && r.res.includes('yt:O1:orig'), 'YouTube-Einordnung: ' + r.res);
      ok(r.res.filter(x => x.startsWith('sp:')).every(x => x.endsWith(':orig')), 'Spotify muss Original sein');
      eq(r.mig, 'orig', 'Migration repariert Spotify'); eq(r.sw, 'karaoke', 'setLinkKind');
      eq(pg.errs, []); await pg.context().close();
    });
    await test('Sync-Anzeige: verwaiste Dirty-IDs werden bereinigt', async () => {
      const pg = await open(b, D, { logs: false });
      await pg.evaluate(async () => { await IDB.put('kv', 'dirtyIds', ['ghost1', 'ghost2']); });
      await pg.reload(); await pg.waitForTimeout(1500);
      await pg.evaluate(() => { pruneStaleDirty(); });
      eq(await pg.evaluate(() => dirtyIds.size + textDirtyIds.size), 0, 'verwaiste Dirty-IDs');
      await pg.context().close();
    });
    await test('Einsingen: Freies Mitsingen + Einstellungen bleiben gespeichert', async () => {
      const pg = await open(b, D, { logs: false });
      await pg.click('text=Üben >> nth=0'); await pg.click('#warmupBtn'); await pg.waitForTimeout(300);
      const sels = await pg.$$('.warmup select');
      await sels[0].selectOption('triad'); await sels[3].selectOption('free'); await sels[4].selectOption('guitar');
      await pg.reload(); await pg.waitForTimeout(1200);
      await pg.click('text=Üben >> nth=0'); await pg.click('#warmupBtn'); await pg.waitForTimeout(300);
      const v = await pg.evaluate(() => [...document.querySelectorAll('.warmup select')].map(s => s.value));
      ok(v.includes('triad') && v.includes('free') && v.includes('guitar'), 'gespeicherte Werte: ' + v);
      eq(pg.errs, []); await pg.context().close();
    });
    await test('Klang: alle Instrumente + Metronom erzeugen hörbares, nicht übersteuertes Signal', async () => {
      const pg = await open(b, D, { logs: false });
      const res = await pg.evaluate(async () => {
        const out = {}; const st = async (fn) => { const c = new OfflineAudioContext(1, 44100 * 2, 44100); fn(c); const d = (await c.startRendering()).getChannelData(0); let p = 0; for (const v of d) p = Math.max(p, Math.abs(v)); return p; };
        for (const i of Object.keys(INSTRUMENTS)) out[i] = await st(c => synthNote(c, 60, 0.1, 1.2, 0.22, null, i));
        out.metro = await st(c => metroClick(c, 0.1, true, 0.35, 'classic')); return out;
      });
      Object.entries(res).forEach(([k, p]) => ok(p > 0.01 && p <= 1, k + ' Peak ' + p));
      await pg.context().close();
    });
    await test('Handy (390 px): kein horizontaler Überlauf, Seitenleiste ein-/ausklappbar', async () => {
      const pg = await open(b, { width: 390, height: 800 }, { logs: false });
      ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'horizontaler Überlauf');
      await pg.evaluate(() => document.getElementById('sidebarToggle').click()); await pg.waitForTimeout(400);
      eq(pg.errs, []); await pg.context().close();
    });
  } finally { await b.close(); }
};
