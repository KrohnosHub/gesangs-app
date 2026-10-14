// Setliste im Auftrittsmodus: Sprungmenü, nächstes Lied (v2.38.0)
const { launch, open } = require('./fixture.js');
module.exports = async () => {
  const { test, eq, ok } = T;
  const b = await launch(); const D = { width: 1280, height: 800 };
  try {
    await test('Auftritt aus Setliste: Sprungmenü zu anderem Lied, nächstes Lied in der Anzeige', async () => {
      const pg = await open(b, D, { logs: false });
      const sid = await pg.evaluate(() => { const id = newSetlistRaw('Test'); setTouch(id, s => { s.it = ['s1', 's2']; }); return id; });
      await pg.evaluate((id) => startSetlist(id), sid); await pg.waitForTimeout(2000);
      eq(await pg.evaluate(() => currentSongId), 's1');
      ok(await pg.isVisible('#perfSetBtn') || await pg.evaluate(() => document.getElementById('perfSetBtn').style.display !== 'none'), 'Knopf da');
      ok(/weiter: Amazing Grace/.test(await pg.evaluate(() => document.getElementById('perfPage').textContent)), 'nächstes Lied genannt');
      await pg.evaluate(() => perfSetJump()); await pg.waitForTimeout(300);
      await pg.evaluate(() => [...document.querySelectorAll('.modal .menu-item')].find(e => e.textContent.includes('Amazing Grace')).click()); await pg.waitForTimeout(1800);
      eq(await pg.evaluate(() => [currentSongId, perfCtx.idx]), ['s2', 1]);
      // ausserhalb einer Setliste kein Knopf
      await pg.evaluate(() => { perfCtx = null; updatePerfPage(); });
      eq(await pg.evaluate(() => document.getElementById('perfSetBtn').style.display), 'none');
      eq(pg.errs, []); await pg.context().close();
    });
  } finally { await b.close(); }
};
