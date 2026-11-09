// Lieder-Vorschläge (v2.56.0): Last.fm-Antworten simuliert, Filter, Ausschluss, Vorschau, Anlegen
const { launch, open } = require('./fixture.js');
module.exports = async () => {
  const { test, eq, ok } = T;
  const b = await launch(); const D = { width: 1280, height: 800 };
  try {
    await test('Vorschläge: Last.fm-Treffer, Bekanntes ausgeblendet, Mehrfachtreffer oben, Anlegen mit YouTube-Link', async () => {
      const pg = await open(b, D, { logs: false });
      await pg.evaluate(() => {
        CONFIG.LASTFM_API_KEY = 'k'; CONFIG.YOUTUBE_API_KEY = 'y';
        lib.songs.a1 = newSong('Oceandeep', 'Beast in Black'); lib.songs.a2 = newSong('Cry for the Moon', 'Epica');
        window.__calls = [];
        window.fetch = async (u) => {
          u = String(u); window.__calls.push(u);
          const J = (o) => ({ ok: true, json: async () => o, text: async () => JSON.stringify(o) });
          if (u.includes('audioscrobbler')) {
            const tr = (t, a, m) => ({ name: t, match: m, artist: { name: a } });
            return J({ similartracks: { track: [tr('Sound of Silence', 'Disturbed', 0.9), tr('Unchained', 'Nightwish', 0.5), tr('Storm', 'Within Temptation', 0.4)] } });
          }
          if (u.includes('youtube/v3/search')) return J({ items: [u.includes('karaoke') ? { id: { videoId: 'karaokeid01' }, snippet: { title: 'Nightwish - Unchained (Karaoke Version)', thumbnails: {} } } : { id: { videoId: 'abcdefghijk' }, snippet: { title: 'Nightwish - Unchained', thumbnails: {} } }] });
          return J({});
        };
        suggestDialog();
      });
      await pg.click('text=Vorschläge holen'); await pg.waitForTimeout(800);
      const rows = await pg.evaluate(() => [...document.querySelectorAll('.modal .file-item b')].map(e => e.textContent));
      ok(rows.includes('Unchained') && rows.includes('Storm'), 'Vorschläge: ' + rows);
      ok(!rows.includes('Sound of Silence'), 'vorhandener Song (Bibliothek) nicht vorgeschlagen');
      ok(rows.indexOf('Unchained') < rows.indexOf('Storm'), 'Mehrfachtreffer/höhere Wertung zuerst');
      ok((await pg.evaluate(() => __calls.filter(c => c.includes('track.getsimilar')).length)) >= 2, 'mehrere Ausgangssongs abgefragt');
      await pg.evaluate(() => { for (let i = 0; i < 25; i++) lib.songs['m' + i] = newSong('Song ' + i, 'Band ' + i); });
      await pg.evaluate(() => { __calls.length = 0; }); await pg.click('text=Neu mischen'); await pg.waitForTimeout(1200);
      eq(await pg.evaluate(() => __calls.filter(c => c.includes('track.getsimilar') || c.includes('track.search')).length), 10);
      await pg.click('text=Vorschläge holen'); await pg.waitForTimeout(1200);      // von vorn: bereits Gezeigtes wieder möglich
      // Vorschau → Mini-Player
      await pg.evaluate(() => { window.__mp = null; window.startMiniPlayerLink = (l) => { window.__mp = l; }; });
      await pg.click('.modal .file-item:has-text("Unchained") >> text=Vorschau'); await pg.waitForTimeout(400);
      eq(await pg.evaluate(() => __mp && __mp.mediaId), 'abcdefghijk');
      // irrelevanter Treffer (Interpret im Titel, aber kein Songtitel) wird nicht abgespielt
      eq(await pg.evaluate(() => [ytRelevant({ title: 'How to KISS a MAN on the NECK' }, { artist: 'KISS', title: 'Rock and Roll All Nite' }), ytRelevant({ title: 'KISS - Rock And Roll All Nite (Official)' }, { artist: 'KISS', title: 'Rock and Roll All Nite' })]), [false, true]);
      // Anlegen
      await pg.click('.modal .file-item:has-text("Unchained") >> text=＋ Song'); await pg.waitForTimeout(400);
      const sg = await pg.evaluate(() => Object.values(lib.songs).find(s => s.n === 'Unchained'));
      ok(sg && sg.ar === 'Nightwish', 'Song angelegt');
      ok(await pg.evaluate(() => [...document.querySelectorAll('.modal h3')].some(e => e.textContent.startsWith('Lyrics für «'))), 'Lyrics-Dialog nach «＋ Song»');
      await pg.waitForTimeout(800);
      const sg2 = await pg.evaluate(() => Object.values(lib.songs).find(s => s.n === 'Unchained'));
      ok(sg2.links.some(l => l.mediaId === 'abcdefghijk'), 'Original-Link (Vorschau)');
      ok(sg2.links.some(l => l.mediaId === 'karaokeid01' && l.kind === 'karaoke'), 'Karaoke automatisch verknüpft: ' + JSON.stringify(sg2.links.map(l => [l.mediaId, l.kind])));
      eq(sg2.links.filter(l => l.kind === 'orig').length, 1);
      await pg.click('text=Später / ohne Text-Blatt fortfahren'); await pg.waitForTimeout(300);
      // Ablehnen bleibt abgelehnt
      await pg.click('.modal .file-item:has-text("Storm") >> text=✕'); await pg.waitForTimeout(200);
      ok((await pg.evaluate(() => JSON.parse(lsGet('sugg_x')).length)) >= 2, 'abgelehnt gemerkt');
      eq(pg.errs, []); await pg.context().close();
    });
    await test('Neu mischen: andere Ausgangssongs, nichts doppelt', async () => {
      const pg = await open(b, D, { logs: false });
      const r = await pg.evaluate(async () => {
        CONFIG.LASTFM_API_KEY = 'k'; Object.keys(lib.songs).forEach(k => delete lib.songs[k]);
        for (let i = 0; i < 30; i++) lib.songs['s' + i] = newSong('Song ' + i, 'Band ' + i);
        const seedsSeen = []; window.fetch = async (u) => {
          u = new URL(String(u)); const a = u.searchParams.get('artist'); seedsSeen.push(a);
          const tr = [0, 1, 2, 3].map(j => ({ name: 'Vorschlag ' + a + ' ' + j, match: 0.9 - j * 0.1, artist: { name: 'X' } }));
          return { ok: true, json: async () => ({ similartracks: { track: tr } }) };
        };
        suggestDialog();
        const btn = (t) => [...document.querySelectorAll('.modal button')].find(x => x.textContent.includes(t));
        const names = () => [...document.querySelectorAll('.modal .file-item b')].map(e => e.textContent);
        btn('Vorschläge holen').click(); await new Promise(r => setTimeout(r, 700)); const n1 = names(), s1 = seedsSeen.slice();
        seedsSeen.length = 0; btn('Neu mischen').click(); await new Promise(r => setTimeout(r, 700)); const n2 = names(), s2 = seedsSeen.slice();
        return { n1, n2, overlapSeeds: s1.filter(x => s2.includes(x)).length, overlapSug: n1.filter(x => n2.includes(x)).length, c1: s1.length, c2: s2.length };
      });
      eq([r.c1, r.c2, r.overlapSeeds, r.overlapSug], [10, 10, 0, 0]);
      ok(r.n1.length > 0 && r.n2.length > 0, 'beide Durchgänge liefern Vorschläge');
      eq(pg.errs, []); await pg.context().close();
    });
    await test('Vorschläge ohne Key: MusicBrainz-Ersatz (Interpreten), Filter Favoriten ohne Treffer', async () => {
      const pg = await open(b, D, { logs: false });
      await pg.evaluate(() => {
        CONFIG.LASTFM_API_KEY = ''; mbLast = 0;
        lib.songs.a1 = Object.assign(newSong('Oceandeep', 'Beast in Black'), { fv: 1 });
        window.fetch = async (u) => {
          u = String(u); const J = (o) => ({ ok: true, json: async () => o });
          if (u.includes('inc=tags')) return J({ tags: [{ name: 'power metal', count: 5 }] });
          if (u.includes('tag%3A')) return J({ artists: [{ id: 'z2', name: 'Sabaton', score: 100 }, { id: 'z1', name: 'Beast in Black', score: 100 }] });
          if (u.includes('artist%3A')) return J({ artists: [{ id: 'z1', name: 'Beast in Black' }] });
          if (u.includes('itunes')) return J({ results: [{ artistName: 'Sabaton', trackName: 'Primo Victoria' }] });
          return J({});
        };
        suggestDialog();
        const sel = document.querySelector('.modal select'); sel.value = 'fav';
      });
      await pg.click('text=Vorschläge holen'); await pg.waitForTimeout(6000);
      const rows = await pg.evaluate(() => [...document.querySelectorAll('.modal .file-item b')].map(e => e.textContent));
      eq(rows, ['Primo Victoria']);
      ok((await pg.evaluate(() => document.querySelector('.modal .file-item .sub').textContent)).includes('Sabaton'), 'Interpret als Zusatzzeile');
      eq(pg.errs, []); await pg.context().close();
    });
    await test('Entities dekodiert; Mini-Player liegt über Dialogen', async () => {
      const pg = await open(b, D, { logs: false });
      eq(await pg.evaluate(() => decodeHtml('H.E.A.T &quot;Dangerous Ground&quot; &amp; Co &#39;x&#39;')), 'H.E.A.T "Dangerous Ground" & Co \'x\'');
      const z = await pg.evaluate(() => [+getComputedStyle($('miniPlayer') || document.body).zIndex || 0, +getComputedStyle(Object.assign(document.createElement('div'), { className: 'modal-bg' })).zIndex || 0]);
      const css = await pg.evaluate(() => [...document.styleSheets].flatMap(s => [...s.cssRules]).filter(r => /miniPlayer$|^\.modal-bg$/.test(r.selectorText || '')).map(r => r.selectorText + ':' + r.style.zIndex));
      const mpz = +css.find(c => c.startsWith('#miniPlayer')).split(':')[1], mz = +css.find(c => c.startsWith('.modal-bg')).split(':')[1];
      ok(mpz > mz, 'miniPlayer z ' + mpz + ' > modal ' + mz);
      eq(pg.errs, []); await pg.context().close();
    });
    await test('Last.fm-Key: in lib.cfg, Merge (neuerer gewinnt), wird auf anderem Gerät übernommen', async () => {
      const pg = await open(b, D, { logs: false });
      const r = await pg.evaluate(() => {
        CONFIG.LASTFM_API_KEY = ''; lsDel('lf_key');
        libCfgSetLf('KEY-A');
        const t0 = lib.cfg.u;
        const m1 = mergeLib(lib, { folders: {}, files: {}, setlists: {}, songs: {}, cfg: { lf: 'KEY-B', u: t0 + 5000 } });
        const m2 = mergeLib(lib, { folders: {}, files: {}, setlists: {}, songs: {}, cfg: { lf: 'KEY-OLD', u: t0 - 5000 } });
        lib = m1; applyLibCfg();                          // anderes Gerät hat später gespeichert
        return [m1.cfg.lf, m2.cfg.lf, CONFIG.LASTFM_API_KEY, lsGet('lf_key')];
      });
      eq(r, ['KEY-B', 'KEY-A', 'KEY-B', 'KEY-B']);
      eq(pg.errs, []); await pg.context().close();
    });
    await test('Neuer Song (manuell): Original & Karaoke werden sofort verknüpft', async () => {
      const pg = await open(b, D, { logs: false });
      await pg.evaluate(() => {
        CONFIG.YOUTUBE_API_KEY = 'y';
        window.fetch = async (u) => { u = String(u); const J = (o) => ({ ok: true, json: async () => o, text: async () => '' });
          if (u.includes('youtube/v3/search')) return J({ items: [u.includes('karaoke') ? { id: { videoId: 'karaokeid02' }, snippet: { title: 'Queen - Bohemian Rhapsody (Karaoke)', thumbnails: {} } } : { id: { videoId: 'origid00002' }, snippet: { title: 'Queen - Bohemian Rhapsody', thumbnails: {} } }] });
          return { ok: false, status: 404, json: async () => ({}), text: async () => '' }; };
        newSongFlow();
      });
      await pg.fill('.modal input >> nth=0', 'Bohemian Rhapsody'); await pg.fill('.modal input >> nth=1', 'Queen');
      await pg.click('.modal button.primary'); await pg.waitForTimeout(1500);
      const sg = await pg.evaluate(() => Object.values(lib.songs).find(s => s.n === 'Bohemian Rhapsody'));
      ok(sg && sg.links.some(l => l.kind === 'karaoke') && sg.links.some(l => l.kind === 'orig'), 'Links: ' + JSON.stringify(sg && sg.links.map(l => l.kind)));
      eq(pg.errs, []); await pg.context().close();
    });
    await test('Song ohne Blatt antippen → Lyrics-Suche statt Fehlermeldung', async () => {
      const pg = await open(b, D, { logs: false });
      await pg.evaluate(() => { lib.songs.nb = newSong('Ohne Blatt', 'Band'); libChanged(); openSong(Object.assign({ id: 'nb' }, lib.songs.nb)); });
      await pg.waitForTimeout(300);
      ok(await pg.evaluate(() => [...document.querySelectorAll('.modal h3')].some(e => e.textContent.includes('Ohne Blatt'))), 'Lyrics-Dialog');
      eq(pg.errs, []); await pg.context().close();
    });
  } finally { await b.close(); }
};
