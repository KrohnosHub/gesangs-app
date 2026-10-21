// Einstieg für neue Nutzer (v2.51.0): Kurzanleitung, Willkommenskarte, Hilfe-Knopf
const { launch, open } = require('./fixture.js');
module.exports = async () => {
  const { test, eq, ok } = T;
  const b = await launch();
  try {
    await test('Kurzanleitung: 8 Schritte, Anmelde-Hinweise, Icons; ❓-Knopf öffnet sie', async () => {
      const pg = await open(b, { width: 1280, height: 800 }, { logs: false });
      await pg.click('#helpBtn'); await pg.waitForTimeout(300);
      const texts = [];
      for (let i = 0; i < 8; i++) {
        texts.push(await pg.evaluate(() => document.querySelector('.modal').innerText));
        const nb = pg.locator('.modal button.primary'); await nb.first().click(); await pg.waitForTimeout(100);
      }
      ok(texts[0].includes('Schritt 1 von 8') && texts[0].includes('nicht überprüft'), 'Schritt 1');
      ok(texts[7].includes('Schritt 8 von 8'), 'Schritt 8');
      ok(texts[1].includes('Android/Chrome') && texts[1].split('\n').filter(l => /Android|iPhone|PC \(/.test(l)).length === 3, 'Geräte je eigene Zeile');
      ok(texts[2].includes('Lyrics') && texts[2].includes('PDF') && !/Gesangslehrerin|Lehrerin/.test(texts.join(' ')), 'Schritt 3 / neutral');
      ok(!await pg.evaluate(() => !!document.querySelector('.modal')), 'Dialog nach «Fertig» zu');
      await pg.click('#helpBtn'); await pg.waitForTimeout(200);
      for (let i = 0; i < 4; i++) { await pg.locator('.modal button.primary').first().click(); await pg.waitForTimeout(80); }
      eq(await pg.evaluate(() => document.querySelectorAll('.modal li svg').length), 7);   // Schritt 5: Icon-Legende
      eq(pg.errs, []); await pg.context().close();
    });
    await test('Leere Bibliothek: Willkommenskarte in Seitenleiste und Startfläche; mit Songs nicht', async () => {
      for (const D of [{ width: 1280, height: 800 }, { width: 390, height: 780 }]) {
        const pg = await open(b, D, { seed: false, logs: false });
        await pg.evaluate(() => { signedOutEl.style.display = 'none'; filesKnown = true; showShell(); renderSheets(); });
        await pg.waitForTimeout(300);
        ok(await pg.evaluate(() => !!document.querySelector('#fileList .welcome')), 'Karte in der Liste ' + D.width);
        if (D.width > 600) ok(await pg.evaluate(() => !!document.querySelector('#empty .welcome')), 'Karte auf der Startfläche');
        await pg.evaluate(() => { lib.songs.z1 = newSong('Test', 'X'); renderSheets(); });
        ok(!(await pg.evaluate(() => !!document.querySelector('#fileList .welcome'))), 'weg mit Song ' + D.width);
        eq(pg.errs, []); await pg.context().close();
      }
    });
  } finally { await b.close(); }
};
