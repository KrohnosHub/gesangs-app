// Doppelseite einpassen, einklappbare Kopfzeile, kompakte Kopfbereiche (v2.33.0)
const { launch, open } = require('./fixture.js');
module.exports = async () => {
  const { test, eq, ok } = T;
  const b = await launch();
  const load = async (pg) => { await pg.evaluate(() => [...document.querySelectorAll('.name')].find(e => e.textContent === 'Sound of Silence').click()); await pg.waitForTimeout(1500); };
  try {
    await test('Doppelseite: beide Seiten standardmässig vollständig sichtbar (PC, Tablet quer, Handy quer)', async () => {
      for (const D of [{ width: 1280, height: 800 }, { width: 1024, height: 700 }, { width: 1180, height: 820 }, { width: 780, height: 390 }]) {
        const pg = await open(b, D, { logs: false }); await load(pg);
        await pg.click('#spreadBtn'); await pg.waitForTimeout(1500);
        const m = await pg.evaluate(() => { const w = $('canvasWrap').getBoundingClientRect(), a = $('baseCanvas').getBoundingClientRect(), c = $('baseCanvas2').getBoundingClientRect();
          return { top: a.top - w.top, bottom: w.bottom - a.bottom, left: a.left - w.left, right: w.right - c.right, lbl: $('zoomLabel').textContent, sx: $('canvasWrap').scrollWidth - $('canvasWrap').clientWidth, sy: $('canvasWrap').scrollHeight - $('canvasWrap').clientHeight }; });
        const tag = JSON.stringify(D) + ' ' + JSON.stringify(m);
        ok(m.top >= -1 && m.bottom >= -1 && m.left >= -1 && m.right >= -1, 'passt nicht ins Fenster: ' + tag);
        ok(m.sx <= 1, 'horizontaler Scroll: ' + tag);
        // wieder Einzelseite → Breite
        await pg.click('#spreadBtn'); await pg.waitForTimeout(800);
        eq(await pg.evaluate(() => $('zoomLabel').textContent), '100%');
        eq(pg.errs, []); await pg.context().close();
      }
    });
    await test('Hochformat (Handy, Tablet hochkant): Doppelseite automatisch aus, Einstellung bleibt, beim Drehen wieder an', async () => {
      const pg = await open(b, { width: 800, height: 1200 }, { logs: false }); await load(pg);
      await pg.click('#spreadBtn'); await pg.waitForTimeout(1200);
      const st = () => pg.evaluate(() => ({ on: document.body.classList.contains('spread-on'), pref: spreadPref, off: $('spreadBtn').classList.contains('portrait-off'), lbl: $('zoomLabel').textContent }));
      eq(await st(), { on: false, pref: true, off: true, lbl: '100%' });
      await pg.setViewportSize({ width: 1200, height: 800 }); await pg.waitForTimeout(1500);
      const q = await st(); eq([q.on, q.off], [true, false]);
      await pg.setViewportSize({ width: 390, height: 780 }); await pg.waitForTimeout(1500);
      eq((await st()).on, false);
      const tb = await pg.evaluate(() => { const t = $('toolbar'), pn = $('pageNav').getBoundingClientRect(), tr = t.getBoundingClientRect(); const ks = [...t.children].filter(c => c.offsetParent !== null).map(c => { const r = c.getBoundingClientRect(); return Math.round((r.top + r.bottom) / 2 / 20); });
        return { rows: new Set(ks).size, pnShown: getComputedStyle($('pageNav')).display === 'none', pnIn: true, floatHidden: (() => { const f = $('pageFloat').getBoundingClientRect(), c = $('canvasWrap'), cr = c.getBoundingClientRect(), st = $('canvasStack').getBoundingClientRect(); return getComputedStyle($('pageFloat')).display !== 'none' && f.height < 30 && (c.scrollHeight <= c.clientHeight + 2 ? f.top >= st.bottom - 1 : true); })(), exp: getComputedStyle($('exportBtn')).display, spr: getComputedStyle($('spreadBtn')).display }; });
      eq([tb.rows, tb.pnShown, tb.pnIn, tb.floatHidden, tb.exp, tb.spr], [1, true, true, true, 'block', 'none']);
      const fit = await pg.evaluate(() => ({ sh: $('canvasStack').getBoundingClientRect().height, ch: $('canvasWrap').clientHeight, tp: totalPages }));
      ok(fit.sh <= fit.ch, 'Hochformat: ganze Seite sichtbar ' + JSON.stringify(fit));
      if (fit.tp > 1) {
        const sw = (x0, x1) => pg.evaluate(([a, b]) => { const st = $('canvasStack'), o = { bubbles: true, pointerId: 7, pointerType: 'touch', isPrimary: true, button: 0 };
          st.dispatchEvent(new PointerEvent('pointerdown', { ...o, clientX: a, clientY: 300 })); st.dispatchEvent(new PointerEvent('pointerup', { ...o, clientX: b, clientY: 310 })); }, [x0, x1]);
        await sw(300, 100); await pg.waitForTimeout(600); eq(await pg.evaluate(() => currentPage), 2);
        await sw(100, 300); await pg.waitForTimeout(600); eq(await pg.evaluate(() => currentPage), 1);
      }
      eq(pg.errs, []); await pg.context().close();
    });
    await test('Kopfbereich: Song-Leiste und Blatt-Reiter in einer Zeile (PC), Kopfzeile kompakt', async () => {
      const pg = await open(b, { width: 1280, height: 800 }, { logs: false }); await load(pg);
      const m = await pg.evaluate(() => ({ sb: $('songBar').getBoundingClientRect().top, st: $('sheetTabs').getBoundingClientRect().top, hh: document.querySelector('header').offsetHeight, tr: $('topRow').offsetHeight }));
      ok(Math.abs(m.sb - m.st) < 3, 'eine Zeile ' + JSON.stringify(m)); ok(m.hh <= 46, 'Header ' + m.hh);
      await pg.context().close();
    });
    await test('Kopfbereich einklappen: Knopf, Platzgewinn, merkt sich den Zustand, nur mit offenem Blatt', async () => {
      const pg = await open(b, { width: 1280, height: 800 }, { logs: false }); await load(pg);
      await pg.click('#spreadBtn'); await pg.waitForTimeout(1200);
      const g = () => pg.evaluate(() => ({ h: $('canvasWrap').clientHeight, hv: getComputedStyle(document.querySelector('header')).display, tv: getComputedStyle($('topRow')).display, lbl: $('zoomLabel').textContent, ph: Math.round($('baseCanvas').getBoundingClientRect().height) }));
      const a = await g(); eq([a.hv, a.tv], ['flex', 'flex']);
      await pg.click('#topToggle'); await pg.waitForTimeout(1500);
      const c = await g(); eq([c.hv, c.tv], ['none', 'none']); ok(c.h > a.h + 70, 'Platz: ' + a.h + ' → ' + c.h); ok(c.ph > a.ph, 'Blatt grösser: ' + a.ph + ' → ' + c.ph);
      await pg.evaluate(() => lsSet('gapp_resume', '0'));   // Start ohne letzten Song, damit kein Blatt offen ist
      await pg.reload(); await pg.waitForTimeout(1200);
      eq(await pg.evaluate(() => document.body.classList.contains('hdr-off')), false);   // ohne offenes Blatt nie ausgeblendet
      eq(await pg.evaluate(() => getComputedStyle(document.querySelector('header')).display), 'flex');
      await load(pg); eq(await pg.evaluate(() => document.body.classList.contains('hdr-off')), true);
      await pg.click('#topHandle'); await pg.waitForTimeout(500);
      eq(await pg.evaluate(() => getComputedStyle(document.querySelector('header')).display), 'flex');
      eq(pg.errs, []); await pg.context().close();
    });
  } finally { await b.close(); }
};
