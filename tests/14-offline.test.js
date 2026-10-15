// «Alles offline», Zähler Blätter/Audio, Songliste ●, Übersicht «Offline & Sync» (v2.43.0)
const { launch, open } = require('./fixture.js');
module.exports = async () => {
  const { test, eq, ok } = T;
  const b = await launch(); const D = { width: 1280, height: 800 };
  try {
    await test('Alles offline: Zähler getrennt, ● nur wenn Blätter UND Audio offline, Fehlende laden, Übersicht', async () => {
      const pg = await open(b, D, { logs: false });
      eq(await pg.evaluate(() => offlineLabel()), 'Blätter 3/3 · Audio 0/0');
      const dot = () => pg.evaluate(() => [...document.querySelectorAll('#fileList .file-item')].filter(e => e.querySelector('.name') && e.querySelector('.name').textContent === 'Sound of Silence').map(e => !!e.querySelector('.off'))[0]);
      eq(await dot(), true);
      await pg.evaluate(() => { window.driveFetch = async () => new Response(new Blob(['x'], { type: 'audio/mpeg' })); addAudio('s1', { id: 'a1', name: 'Backing 1', kind: 'backing' }); addAudio('s1', { id: 'a2', name: 'Aufnahme 1', kind: 'take' }); });
      await pg.waitForTimeout(500);
      eq(await pg.evaluate(() => offlineLabel()), 'Blätter 3/3 · Audio 0/2');
      eq(await dot(), false);                                                      // Audio fehlt → kein ●
      // Übersicht
      await pg.evaluate(() => offlineOverview()); await pg.waitForTimeout(300);
      const txt = await pg.evaluate(() => document.querySelector('.offsync').textContent);
      ok(/Backing 1/.test(txt) && /Aufnahme 1/.test(txt) && /nicht offline/.test(txt) && /in Drive/.test(txt), 'Übersicht: ' + txt.slice(0, 200));
      ok(/Fehlende laden \(2\)/.test(txt), 'Knopf');
      await pg.evaluate(() => [...document.querySelectorAll('.offsync button')].find(x => /Fehlende laden/.test(x.textContent)).click()); await pg.waitForTimeout(1200);
      eq(await pg.evaluate(() => offlineLabel()), 'Blätter 3/3 · Audio 2/2');
      eq(await dot(), true);
      ok(await pg.evaluate(() => /Alles offline/.test([...document.querySelectorAll('.offsync button')].map(x => x.textContent).join('|'))), 'Knopf «Alles offline»');
      await pg.keyboard.press('Escape');
      // «Mehr»-Menü: Eintrag mit Zähler und Übersicht
      await pg.evaluate(() => $('moreMenuBtn').click()); await pg.waitForTimeout(300);
      const m = await pg.evaluate(() => [...document.querySelectorAll('.modal .menu-item')].map(e => e.textContent));
      ok(m.some(x => /Alles offline speichern \(Blätter 3\/3 · Audio 2\/2\)/.test(x)), 'Mehr: ' + JSON.stringify(m));
      ok(m.some(x => /Offline & Sync/.test(x)), 'Mehr: Offline & Sync');
      // Song-Menü: entfernen löscht Blätter und Audio
      await pg.keyboard.press('Escape');
      await pg.evaluate(() => toggleOfflineSong({ id: 's1' })); await pg.waitForTimeout(500);
      eq(await pg.evaluate(() => offlineLabel()), 'Blätter 1/3 · Audio 0/2');
      eq(pg.errs, []); await pg.context().close();
    });
  } finally { await b.close(); }
};
