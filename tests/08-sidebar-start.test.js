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
    await test('Doppelseite: rechte Seite bleibt nach Auftrittsmodus, Blättern und Grössenänderung sichtbar (nicht weiss)', async () => {
      const dark = pg => pg.evaluate(() => { const c = $('baseCanvas2'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 0 && d[i] < 128) n++; return n; });
      for (const D of [{ width: 1280, height: 800 }, { width: 820, height: 560 }]) {
        const pg = await open(b, D, { logs: false });
        await pg.evaluate(async () => {
          const { PDFDocument, StandardFonts } = await loadPdfLib(); const d = await PDFDocument.create(); const f = await d.embedFont(StandardFonts.Helvetica);
          for (let p = 0; p < 5; p++) { const pp = d.addPage([595, 842]); pp.drawText('SEITE ' + (p + 1), { x: 50, y: 700, size: 90, font: f }); }
          const pdf = await d.save(); const ab = pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength);
          await IDB.put('blobs', 'f1', { buf: ab, mime: 'application/pdf', md5: 'a', name: 'Sound of Silence.pdf', dirty: 0 });
        });
        await pg.evaluate(() => [...document.querySelectorAll('.name')].find(e => e.textContent === 'Sound of Silence').click()); await pg.waitForTimeout(1500);
        await pg.click('#spreadBtn'); await pg.waitForTimeout(1200);
        ok(await dark(pg) > 500, 'Doppelseite zunächst: ' + await dark(pg));
        await pg.click('#perfBtn'); await pg.waitForTimeout(1800);
        ok(await dark(pg) > 500, 'Auftritt: ' + await dark(pg));
        await pg.evaluate(() => exitPerf()); await pg.waitForTimeout(1800);
        ok(await dark(pg) > 500, 'nach Auftritt: ' + await dark(pg));
        await pg.setViewportSize({ width: D.width - 100, height: D.height }); await pg.waitForTimeout(100);
        await pg.evaluate(() => { applyCssSize(); scheduleRender(10); }); await pg.waitForTimeout(1500);
        ok(await dark(pg) > 500, 'nach Grössenänderung: ' + await dark(pg));
        // Zweitseite neu belegen, ohne dass sich Inhalt/Grösse ändert (Canvas wird geleert, Cache bleibt gültig)
        await pg.evaluate(() => renderSecond()); await pg.waitForTimeout(1200);
        ok(await dark(pg) > 500, 'nach erneutem Rendern: ' + await dark(pg));
        eq(pg.errs, []); await pg.context().close();
      }
    });
  } finally { await b.close(); }
};
