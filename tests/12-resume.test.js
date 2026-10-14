// Beim Start zuletzt geöffneten Song laden (v2.37.0)
const { launch, open } = require('./fixture.js');
module.exports = async () => {
  const { test, eq, ok } = T;
  const b = await launch(); const D = { width: 1280, height: 800 };
  const cur = (pg) => pg.evaluate(() => currentSongId);
  try {
    await test('Start: Standard = leere Übersicht; mit Einstellung wird der zuletzt geöffnete Song geladen', async () => {
      const pg = await open(b, D, { logs: false });
      await pg.evaluate(() => [...document.querySelectorAll('.name')].find(e => e.textContent === 'Sound of Silence').click()); await pg.waitForTimeout(1200);
      eq(await cur(pg), 's1');
      await pg.waitForTimeout(1200); await pg.reload(); await pg.waitForTimeout(2000);
      eq(await cur(pg), null);                                                          // aus (Standard)
      // Einstellung im Dialog einschalten
      await pg.evaluate(() => openSettingsDialog()); await pg.waitForTimeout(300);
      await pg.evaluate(() => { const l = [...document.querySelectorAll('.modal label')].find(x => x.textContent.includes('zuletzt geöffneten Song')); l.querySelector('input').click(); });
      eq(await pg.evaluate(() => localStorage.getItem('gapp_resume') || [...Object.keys(localStorage)].filter(k => /resume/.test(k)).map(k => localStorage[k])[0]), '1');
      await pg.keyboard.press('Escape');
      await pg.waitForTimeout(1200); await pg.reload(); await pg.waitForTimeout(2500);
      eq(await cur(pg), 's1');
      ok(await pg.evaluate(() => !!currentFile), 'Blatt geöffnet');
      // gelöschter Song → normaler Start
      await pg.evaluate(() => { lsSet('gapp_lastsong', JSON.stringify({ s: 'gibtsnicht', f: 'x' })); });
      await pg.reload(); await pg.waitForTimeout(2000);
      eq(await cur(pg), null);
      eq(pg.errs, []); await pg.context().close();
    });
  } finally { await b.close(); }
};
