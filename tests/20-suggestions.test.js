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
          if (u.includes('youtube/v3/search')) return J({ items: [{ id: { videoId: 'abcdefghijk' }, snippet: { title: 'Nightwish - Unchained', thumbnails: {} } }] });
          return J({});
        };
        suggestDialog();
      });
      await pg.click('text=Vorschläge holen'); await pg.waitForTimeout(800);
      const rows = await pg.evaluate(() => [...document.querySelectorAll('.modal .file-item b')].map(e => e.textContent));
      ok(rows.includes('Unchained') && rows.includes('Storm'), 'Vorschläge: ' + rows);
      ok(!rows.includes('Sound of Silence'), 'vorhandener Song (Bibliothek) nicht vorgeschlagen');
      ok(rows.indexOf('Unchained') < rows.indexOf('Storm'), 'Mehrfachtreffer/höhere Wertung zuerst');
      ok((await pg.evaluate(() => __calls.filter(c => c.includes('audioscrobbler')).length)) >= 2, 'mehrere Ausgangssongs abgefragt');
      // Vorschau → Mini-Player
      await pg.evaluate(() => { window.__mp = null; window.startMiniPlayerLink = (l) => { window.__mp = l; }; });
      await pg.click('.modal .file-item:has-text("Unchained") >> text=Vorschau'); await pg.waitForTimeout(400);
      eq(await pg.evaluate(() => __mp && __mp.mediaId), 'abcdefghijk');
      // Anlegen
      await pg.click('.modal .file-item:has-text("Unchained") >> text=＋ Song'); await pg.waitForTimeout(400);
      const sg = await pg.evaluate(() => Object.values(lib.songs).find(s => s.n === 'Unchained'));
      ok(sg && sg.ar === 'Nightwish', 'Song angelegt');
      eq(sg.links.map(l => l.mediaId), ['abcdefghijk']);
      // Ablehnen bleibt abgelehnt
      await pg.click('.modal .file-item:has-text("Storm") >> text=✕'); await pg.waitForTimeout(200);
      ok((await pg.evaluate(() => JSON.parse(lsGet('sugg_x')).length)) >= 2, 'abgelehnt gemerkt');
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
          return J({});
        };
        suggestDialog();
        const sel = document.querySelector('.modal select'); sel.value = 'fav';
      });
      await pg.click('text=Vorschläge holen'); await pg.waitForTimeout(6000);
      const rows = await pg.evaluate(() => [...document.querySelectorAll('.modal .file-item b')].map(e => e.textContent));
      eq(rows, ['Sabaton']);
      eq(pg.errs, []); await pg.context().close();
    });
  } finally { await b.close(); }
};
