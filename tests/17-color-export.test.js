// Farb-Sammelknopf und PDF-Export mit/ohne Annotationen (v2.50.0)
const { launch, open } = require('./fixture.js');
module.exports = async () => {
  const { test, eq, ok } = T;
  const b = await launch();
  const load = async (pg) => { await pg.evaluate(() => [...document.querySelectorAll('.name')].find(e => e.textContent === 'Sound of Silence').click()); await pg.waitForTimeout(1500); };
  try {
    await test('Farben: Schnellfarben + Sammelknopf mit Popup, gewählte Farbe bleibt sichtbar', async () => {
      for (const D of [{ width: 1280, height: 800 }, { width: 390, height: 780 }]) {
        const pg = await open(b, D, { logs: false }); await load(pg);
        await pg.click('#modeDraw'); await pg.waitForTimeout(300);
        eq(await pg.evaluate(() => [...document.querySelectorAll('#colorQuick .swatch')].filter(e => e.offsetParent !== null).length), 4);   // 3 + Sammelknopf
        await pg.click('#colorMore'); await pg.waitForTimeout(200);
        const pop = await pg.evaluate(() => { const p = $('colorPop'), r = p.getBoundingClientRect(); return { show: p.classList.contains('show'), n: p.querySelectorAll('.swatch').length, inside: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight }; });
        eq([pop.show, pop.n, pop.inside], [true, 12, true]);
        await pg.click('#colorPop .swatch[data-color="#8e44ad"]'); await pg.waitForTimeout(200);
        eq(await pg.evaluate(() => ({ c: color, pop: $('colorPop').classList.contains('show'), ex: $('colorExtra').style.display !== 'none', exc: $('colorExtra').dataset.color })), { c: '#8e44ad', pop: false, ex: true, exc: '#8e44ad' });
        await pg.click('#colorQuick .swatch[data-color="#c0392b"]'); await pg.waitForTimeout(100);
        eq(await pg.evaluate(() => ({ c: color, ex: $('colorExtra').style.display !== 'none' })), { c: '#c0392b', ex: false });
        eq(pg.errs, []); await pg.context().close();
      }
    });
    await test('PDF-Export: Knopf in der Leiste (auch Handy hochkant), Option «Mit Annotationen»', async () => {
      const pg = await open(b, { width: 390, height: 780 }, { logs: false }); await load(pg);
      ok(await pg.evaluate(() => { const e = $('exportBtn'); return getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().right <= innerWidth; }), 'Knopf sichtbar');
      await pg.evaluate(() => { window.__o = null; exportDialog({ build: (o) => { window.__o = o; return new Uint8Array([37, 80, 68, 70]); }, annotOption: true, downloadName: 'x (annotiert).pdf', sheetName: 'x (annotiert).pdf', srcFile: null }); });
      await pg.waitForTimeout(200);
      eq(await pg.evaluate(() => { const l = [...document.querySelectorAll('.modal label')].find(x => x.textContent.includes('Mit Annotationen')); return l && l.querySelector('input').checked; }), true);
      await pg.evaluate(() => { [...document.querySelectorAll('.modal label')].find(x => x.textContent.includes('Mit Annotationen')).querySelector('input').click(); });
      await pg.evaluate(() => [...document.querySelectorAll('.modal button')].find(x => x.textContent.includes('Herunterladen')).click()); await pg.waitForTimeout(500);
      eq(await pg.evaluate(() => window.__o && window.__o.annot), false);
      await pg.context().close();
    });
  } finally { await b.close(); }
};
