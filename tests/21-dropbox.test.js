// Dropbox-Anbindung (v2.59.0): Zuordnung Dateiname ↔ Song, Abgleich-Dialog, manuelle Auswahl, Anmelde-Rückkehr (alles simuliert)
const { launch, open } = require('./fixture.js');
module.exports = async () => {
  const { test, eq, ok } = T;
  const b = await launch(); const D = { width: 1280, height: 800 };
  const setup = (pg) => pg.evaluate(() => {
    CONFIG.DROPBOX_APP_KEY = 'appkey'; lsSet('dbx_rt', 'refresh');
    window.__dbx = { at: 'tok', exp: Date.now() + 3600e3 };
    lib.songs.s1 = newSong('Oceandeep', 'Beast in Black'); lib.songs.s2 = newSong('Hello', 'Adele'); lib.songs.s3 = newSong('Hello Again', 'Foo');
    window.__imp = []; window.requireOnline = async () => true;
    window.runBackingImport = async (songId, file, o) => { __imp.push({ songId, fname: file.name, name: o.name, semi: o.semi, dbx: o.extra && o.extra.dbx }); addAudio(songId, { id: 'a' + __imp.length, name: o.name, kind: 'backing', dbx: o.extra && o.extra.dbx }); return { id: 'x' }; };
    const E = (n, i) => ({ '.tag': 'file', name: n, id: 'id:' + i, path_display: '/Matthias Krohn - Gesangsunterricht/Instrumentals/' + n });
    window.__entries = [E('Beast in Black - Oceandeep (Instrumental).mp3', 1), E('Adele_Hello_-2.mp3', 2), E('Unbekannt - Irgendwas.mp3', 3), E('Notizen.txt', 4)];
    window.fetch = async (u, o) => {
      u = String(u); const J = (x) => ({ ok: true, json: async () => x, text: async () => JSON.stringify(x) });
      if (u.includes('list_folder')) return J({ entries: __entries, has_more: false });
      if (u.includes('files/download')) return { ok: true, blob: async () => new Blob(['abc'], { type: 'audio/mpeg' }) };
      return J({});
    };
  });
  try {
    await test('Dropbox: Dateiname ↔ Song', async () => {
      const pg = await open(b, D, { logs: false }); await setup(pg);
      const r = await pg.evaluate(() => dbxMatch(__entries.slice(0, 3)).map(m => [m.entry.id, m.song && m.song.n]));
      eq(r, [['id:1', 'Oceandeep'], ['id:2', 'Hello'], ['id:3', null]]);
      eq(pg.errs, []); await pg.context().close();
    });
    await test('Dropbox: Ordner abgleichen importiert + verknüpft, kein Doppelimport', async () => {
      const pg = await open(b, D, { logs: false }); await setup(pg);
      await pg.evaluate(() => { dbxSyncDialog(); }); await pg.waitForSelector('text=Zuordnen & importieren');
      ok(await pg.evaluate(() => document.querySelector('.modal').textContent.includes('Unbekannt - Irgendwas.mp3')), 'Nicht Zugeordnetes aufgelistet');
      await pg.click('text=Zuordnen & importieren'); await pg.waitForTimeout(600);
      const imp = await pg.evaluate(() => __imp);
      eq(imp.map(x => [x.fname, x.semi, x.dbx]), [['Adele_Hello_-2.mp3', -2, 'id:2'], ['Beast in Black - Oceandeep (Instrumental).mp3', 0, 'id:1']]);
      const s = await pg.evaluate(() => lib.songs.s1.links);
      ok(s.length === 1 && s[0].type === 'dbx' && s[0].kind === 'karaoke' && s[0].url.startsWith('https://www.dropbox.com/home/Matthias%20Krohn%20-%20Gesangsunterricht/Instrumentals?preview='), JSON.stringify(s));
      eq(await pg.evaluate(() => linkGroup(lib.songs.s1.links[0])), 'xm');
      await pg.evaluate(() => { document.querySelectorAll('.modal-bg').forEach(e => e.remove()); __imp.length = 0; dbxSyncDialog(); });
      await pg.waitForSelector('.dbx-sync'); await pg.waitForTimeout(200);
      ok(await pg.evaluate(() => !document.querySelector('.dbx-sync').closest('.modal').textContent.includes('Zuordnen & importieren') && document.querySelector('.dbx-sync .sub').textContent.includes('0 neu zuordenbar')), 'nichts Neues → kein Importknopf');
      eq(pg.errs, []); await pg.context().close();
    });
    await test('Dropbox: manuelle Auswahl im Song', async () => {
      const pg = await open(b, D, { logs: false }); await setup(pg);
      await pg.evaluate(() => { dbxPickDialog('s2'); }); await pg.waitForSelector('.modal .pick-row');
      await pg.click('.modal .pick-row:has-text("Adele_Hello")'); await pg.waitForTimeout(500);
      eq(await pg.evaluate(() => [__imp.length, __imp[0].songId, lib.songs.s2.links[0].mediaId]), [1, 's2', 'id:2']);
      eq(pg.errs, []); await pg.context().close();
    });
    await test('Dropbox: Rückkehr von der Anmeldung tauscht Code gegen Refresh-Token', async () => {
      const pg = await open(b, D, { logs: false });
      const r = await pg.evaluate(async () => {
        CONFIG.DROPBOX_APP_KEY = 'appkey'; lsDel('dbx_rt'); lsSet('dbx_pk', JSON.stringify({ v: 'ver', s: 'st1' }));
        history.replaceState(null, '', location.pathname + '?code=abc&state=st1');
        let body = '';
        window.fetch = async (u, o) => { body = String(o.body); return { ok: true, json: async () => ({ access_token: 'a', refresh_token: 'r1', expires_in: 14400 }) }; };
        await dbxHandleRedirect();
        return { rt: lsGet('dbx_rt'), q: location.search, body };
      });
      eq(r.rt, 'r1'); eq(r.q, ''); ok(r.body.includes('code_verifier=ver') && r.body.includes('grant_type=authorization_code') && r.body.includes('client_id=appkey'), r.body);
      eq(pg.errs, []); await pg.context().close();
    });
    await test('Dropbox: ungültiger App key (URL) wird abgewiesen', async () => {
      const pg = await open(b, D, { logs: false });
      eq(await pg.evaluate(() => [dbxKeyOk('https://krohnoshub.github.io/gesangs-app/'), dbxKeyOk('c138jydva0ccqek'), dbxKeyOk('')]), [false, true, false]);
      await pg.evaluate(() => { CONFIG.DROPBOX_APP_KEY = 'https://x.io/'; dbxLogin(); }); await pg.waitForTimeout(300);
      ok(await pg.evaluate(() => !location.href.includes('dropbox.com')), 'keine Weiterleitung');
      eq(pg.errs, []); await pg.context().close();
    });
  } finally { await b.close(); }
};
