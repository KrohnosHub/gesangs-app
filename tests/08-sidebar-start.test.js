// Songliste beim Start offen auf Handy/Tablet (v2.32.0)
const { launch, open } = require('./fixture.js');
module.exports = async () => {
  const { test, eq, ok } = T;
  const b = await launch();
  try {
    await test('Seitenleiste: Handy/Tablet offen beim Start, Hinweis nur Tablet, Desktop unverändert', async () => {
      const st = pg => pg.evaluate(() => ({
        open: $('sidebar').classList.contains('open'),
        hint: getComputedStyle($('empty')).display,
        txt: $('empty').textContent,
        padL: parseFloat(getComputedStyle($('empty')).paddingLeft),
        sbR: $('sidebar').getBoundingClientRect().right, hintL: $('empty').querySelector ? 0 : 0 }));
      let pg = await open(b, { width: 390, height: 800 }, { logs: false }); await pg.waitForTimeout(400);
      let s = await st(pg); eq(s.open, true); eq(s.hint, 'none');
      // nach Auswahl eines Songs schliesst sie wieder
      await pg.context().close();
      pg = await open(b, { width: 768, height: 1000 }, { logs: false }); await pg.waitForTimeout(400);
      s = await st(pg); eq(s.open, true); eq(s.hint, 'flex'); ok(s.padL > 340, 'Hinweis rechts neben der Liste: ' + s.padL);
      ok(!/bzw\. links|☰/.test(s.txt), s.txt);
      await pg.context().close();
      pg = await open(b, { width: 1280, height: 800 }, { logs: false }); await pg.waitForTimeout(400);
      s = await st(pg); eq(s.open, false); eq(s.hint, 'flex');
      eq(pg.errs, []); await pg.context().close();
    });
  } finally { await b.close(); }
};
