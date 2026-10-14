// Schnellstart Original/Karaoke (v2.34.0)
const { launch, open } = require('./fixture.js');
module.exports = async () => {
  const { test, eq, ok } = T;
  const b = await launch(); const D = { width: 1280, height: 800 };
  const setup = async (pg, links) => {
    await pg.evaluate(() => { window.loadYouTubeApi = () => new Promise(() => {}); window.loadSpotifyApi = () => new Promise(() => {}); });   // kein Netz im Test: Player bleibt «ladend»
    await pg.evaluate((links) => sTouch('s1', s => { s.links = links; }), links);
    await pg.evaluate(() => [...document.querySelectorAll('.name')].find(e => e.textContent === 'Sound of Silence').click()); await pg.waitForTimeout(1200);
  };
  const L = (id, type, kind, title) => ({ id, type, kind, mediaId: id, title, url: 'https://x/' + id, u: 1 });
  try {
    await test('Schnellstart: Knöpfe, Abspielen, andere Version wählen = anheften, x-minus ausgeschlossen, Favorit in Kopfzeile', async () => {
      const pg = await open(b, D, { logs: false });
      await setup(pg, [L('o1', 'yt', 'orig', 'Original A'), L('o2', 'yt', 'orig', 'Original B'), L('k1', 'sp', 'karaoke', 'Karaoke Spotify'), L('k2', 'yt', 'karaoke', 'Karaoke YT'), L('x1', 'xm', 'karaoke', 'x-minus')]);
      const q = () => pg.evaluate(() => [...document.querySelectorAll('#songBar button.quick')].map(b => b.dataset.quick + ':' + b.title.split('«')[1].split('»')[0]));
      eq(await q(), ['orig:Original A', 'kar:Karaoke Spotify']);       // nicht angeheftet: erste abspielbare, x-minus nie
      ok(await pg.evaluate(() => document.querySelectorAll('#songBar .quick-more').length) === 2, '▾ bei mehreren Versionen');
      await pg.click('#songBar button.quick[data-quick="orig"]'); await pg.waitForTimeout(500);
      eq(await pg.evaluate(() => mp.link && mp.link.id), 'o1');
      ok(await pg.evaluate(() => document.querySelector('#songBar button.quick[data-quick="orig"]').classList.contains('on')), 'Knopf zeigt: läuft');
      // andere Version wählen → gemerkt (angeheftet) und gespielt
      await pg.evaluate(() => quickChoose({ id: 's1' }, 'orig')); await pg.waitForTimeout(300);
      await pg.evaluate(() => [...document.querySelectorAll('.modal .menu-item')].find(e => e.textContent.includes('Original B')).click()); await pg.waitForTimeout(600);
      eq(await pg.evaluate(() => [lib.songs.s1.pin, mp.link.id]), [{ orig: 'o2' }, 'o2']);
      eq((await q())[0], 'orig:Original B');
      // Anheften über Verknüpfungen (📌)
      await pg.evaluate(() => manageLinks({ id: 's1', ...lib.songs.s1 })); await pg.waitForTimeout(400);
      await pg.evaluate(() => [...document.querySelectorAll('.modal .pick-row')].find(r => r.textContent.includes('Karaoke YT')).querySelector('button[title^="Als Schnellstart"]').click()); await pg.waitForTimeout(300);
      eq(await pg.evaluate(() => lib.songs.s1.pin), { orig: 'o2', kar: 'k2' });
      ok(await pg.evaluate(() => document.querySelector('.modal').textContent.includes('📌 Schnellstart')), 'Markierung in der Liste');
      eq(await pg.evaluate(() => document.querySelectorAll('.modal .pick-row button[title*="Schnellstart"]').length), 4);   // nur abspielbare (yt/sp), nicht x-minus
      await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
      // Favorit jetzt in der Kopfzeile (nicht mehr in der Song-Leiste)
      eq(await pg.evaluate(() => [...document.querySelectorAll('#songBar button')].some(b => /Favorit/.test(b.title))), false);
      const fv0 = await pg.evaluate(() => !!lib.songs.s1.fv); await pg.click('#favBtn'); await pg.waitForTimeout(200);
      eq(await pg.evaluate(() => !!lib.songs.s1.fv), !fv0);
      // bleibt nach Neustart erhalten
      await pg.waitForTimeout(1200); await pg.reload(); await pg.waitForTimeout(1500);
      eq(await pg.evaluate(() => lib.songs.s1.pin), { orig: 'o2', kar: 'k2' });
      eq(pg.errs, []); await pg.context().close();
    });
    await test('Schnellstart: Song ohne passende Verknüpfung zeigt keine Knöpfe', async () => {
      const pg = await open(b, D, { logs: false });
      await setup(pg, [L('x1', 'xm', 'karaoke', 'x-minus')]);
      eq(await pg.evaluate(() => document.querySelectorAll('#songBar button.quick').length), 0);
      await pg.context().close();
    });
    await test('Schnellstart: Backing-Track-Datei erscheint bei Karaoke (auch ohne Karaoke-Link), hat Vorrang, wählbar', async () => {
      const pg = await open(b, D, { logs: false });
      await setup(pg, [L('o1', 'yt', 'orig', 'Original A'), L('k1', 'yt', 'karaoke', 'Karaoke YT')]);
      const kar = () => pg.evaluate(() => { const b = document.querySelector('#songBar button.quick[data-quick="kar"]'); return b ? b.title : null; });
      eq(/Karaoke YT/.test(await kar()), true);
      await pg.evaluate(() => addAudio('s1', { id: 'bk1', name: 'Mein Backing', kind: 'backing' }));
      await pg.waitForTimeout(300);
      eq(/Mein Backing/.test(await kar()), true);                                   // Datei gewinnt
      eq(await pg.evaluate(() => document.querySelectorAll('#songBar button.quick-more').length), 1);   // mehrere Quellen → ▾
      await pg.evaluate(() => sTouch('s1', s => { s.links = [{ id: 'o1', type: 'yt', kind: 'orig', mediaId: 'o1', title: 'Original A', url: 'https://x/o1', u: 1 }]; }));
      await pg.waitForTimeout(300);
      eq(/Mein Backing/.test(await kar()), true);                                   // nur Backing-Datei, kein Karaoke-Link
      eq(await pg.evaluate(() => quickTarget('s1', 'orig').id), 'o1');              // Original unberührt
      eq(pg.errs, []); await pg.context().close();
    });
    await test('Aufnahmen: Backing-Datei gewinnt; sonst Karaoke (Schnellstart); Original nie automatisch', async () => {
      const pg = await open(b, D, { logs: false });
      await setup(pg, [L('o1', 'yt', 'orig', 'Original A'), L('k1', 'yt', 'karaoke', 'Karaoke 1'), L('k2', 'yt', 'karaoke', 'Karaoke 2')]);
      const sel = async () => { await pg.evaluate(() => openRecorder(Object.assign({ id: 's1' }, lib.songs.s1))); await pg.waitForTimeout(600); const v = await pg.evaluate(() => { const s = document.querySelector('.recorder select'); return s ? s.value : 'kein-select'; }); await pg.evaluate(() => document.querySelector('.modal-bg:last-child .modal button') && document.querySelector('.modal-bg:last-child').remove()); return v; };
      eq(await sel(), 'k1');                                                       // erste Karaoke, nicht das Original
      await pg.evaluate(() => setPin('s1', 'kar', 'k2'));
      eq(await sel(), 'k2');                                                       // angeheftet
      await pg.evaluate(() => addAudio('s1', { id: 'bk1', name: 'Mein Backing', kind: 'backing' }));
      eq(await sel(), 'file:bk1');                                                 // Backing-Datei gewinnt
      await pg.evaluate(() => sTouch('s1', s => { s.links = [{ id: 'o1', type: 'yt', kind: 'orig', mediaId: 'o1', title: 'Original A', url: 'https://x/o1', u: 1 }]; s.audio = []; delete s.pin; }));
      eq(await sel(), 'none');                                                     // nur Original vorhanden → nichts vorgeschlagen
      eq(pg.errs, []); await pg.context().close();
    });
  } finally { await b.close(); }
};
