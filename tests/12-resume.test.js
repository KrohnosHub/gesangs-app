// Beim Start zuletzt geöffneten Song laden (v2.37.0)
const { launch, open } = require('./fixture.js');
module.exports = async () => {
  const { test, eq, ok } = T;
  const b = await launch(); const D = { width: 1280, height: 800 };
  const cur = (pg) => pg.evaluate(() => currentSongId);
  try {
    await test('Start: Standard = letzter Song wird geladen; abschaltbar', async () => {
      const pg = await open(b, D, { logs: false });
      await pg.evaluate(() => [...document.querySelectorAll('.name')].find(e => e.textContent === 'Sound of Silence').click()); await pg.waitForTimeout(1200);
      eq(await cur(pg), 's1');
      await pg.waitForTimeout(1200); await pg.reload(); await pg.waitForTimeout(2500);
      eq(await cur(pg), 's1');                                                          // an (Standard)
      ok(await pg.evaluate(() => !!currentFile), 'Blatt geöffnet');
      // Einstellung im Dialog ausschalten → Start mit leerer Übersicht
      await pg.evaluate(() => openSettingsDialog()); await pg.waitForTimeout(300);
      eq(await pg.evaluate(() => [...document.querySelectorAll('.modal label')].find(x => x.textContent.includes('zuletzt geöffneten Song')).querySelector('input').checked), true);
      await pg.evaluate(() => { [...document.querySelectorAll('.modal label')].find(x => x.textContent.includes('zuletzt geöffneten Song')).querySelector('input').click(); });
      await pg.keyboard.press('Escape');
      await pg.waitForTimeout(1200); await pg.reload(); await pg.waitForTimeout(2000);
      eq(await cur(pg), null);
      await pg.evaluate(() => lsSet('gapp_resume', '1'));
      // gelöschter Song → normaler Start
      await pg.evaluate(() => { lsSet('gapp_lastsong', JSON.stringify({ s: 'gibtsnicht', f: 'x' })); });
      await pg.reload(); await pg.waitForTimeout(2000);
      eq(await cur(pg), null);
      eq(pg.errs, []); await pg.context().close();
    });
  } finally { await b.close(); }
};
