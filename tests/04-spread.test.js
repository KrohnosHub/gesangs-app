// Zwei-Seiten-Ansicht (PDF + Text) und Blätter-Hilfen im Auftrittsmodus (v2.23.0)
const { launch, open } = require('./fixture.js');
module.exports = async () => {
  const { test, eq, ok } = T;
  const b = await launch(); const D = { width: 1280, height: 800 };
  const st = (pg) => pg.evaluate(() => ({ cls: document.body.className, label: document.getElementById('pageLabel').textContent, p: currentPage, c2: getComputedStyle(document.getElementById('baseCanvas2')).display, nextDis: document.getElementById('nextPage').disabled }));
  const wait = (pg, ms = 900) => pg.waitForTimeout(ms);
  const prep = async (pg) => {
    await pg.evaluate(async () => {            // 5-seitiges PDF statt der 2 Seiten
      const { PDFDocument, StandardFonts } = await loadPdfLib(); const d = await PDFDocument.create(); const f = await d.embedFont(StandardFonts.Helvetica);
      for (let p = 0; p < 5; p++) { const pp = d.addPage([595, 842]); pp.drawText('SEITE ' + (p + 1), { x: 50, y: 780, size: 40, font: f }); }
      const pdf = await d.save(); const ab = pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength);
      await IDB.put('blobs', 'f1', { buf: ab, mime: 'application/pdf', md5: 'a', name: 'Sound of Silence.pdf', dirty: 0 });
      let h = '<div class="lyrics-doc" style="font-size:20px;line-height:1.9;">'; for (let i = 0; i < 14; i++) { h += '<p class="lbl">Strophe ' + (i + 1) + '</p>'; for (let j = 0; j < 4; j++) h += '<p>Zeile ' + j + ' dieser Strophe mit etwas Text darin</p>'; } h += '</div>';
      await IDB.put('blobs', 'f2', { buf: textBuf(h), mime: TXT_MIME, md5: 'b', name: 'Text.html', dirty: 0 });
    });
    await pg.evaluate(() => [...document.querySelectorAll('.name')].find(e => e.textContent === 'Sound of Silence').click()); await wait(pg, 1500);
  };
  try {
    await test('PDF: 2 Seiten nebeneinander, Blättern in Doppelseiten, letzte Einzelseite', async () => {
      const pg = await open(b, D, { logs: false }); await prep(pg);
      eq((await st(pg)).label, '1 / 5');
      await pg.click('#spreadBtn'); await wait(pg, 1200);
      let s = await st(pg); eq([s.label, s.c2, s.cls.includes('spread-on')], ['1–2 / 5', 'block', true]);
      await pg.click('#nextPage'); await wait(pg); s = await st(pg); eq([s.label, s.p], ['3–4 / 5', 3]);
      await pg.click('#nextPage'); await wait(pg); s = await st(pg); eq([s.label, s.c2, s.nextDis], ['5 / 5', 'none', true]);
      await pg.keyboard.press('ArrowLeft'); await wait(pg); eq((await st(pg)).label, '3–4 / 5', 'Pfeiltaste zurück');
      const dims = await pg.evaluate(() => { const a = document.getElementById('baseCanvas').getBoundingClientRect(), c = document.getElementById('baseCanvas2').getBoundingClientRect(); return { w1: Math.round(a.width), w2: Math.round(c.width), gap: Math.round(c.left - a.right) }; });
      ok(dims.w1 === dims.w2 && dims.gap > 0 && dims.gap < 40, 'Geometrie ' + JSON.stringify(dims));
      eq(pg.errs, []); await pg.context().close();
    });
    await test('Zeichnen schaltet auf eine Seite, Lesen zurück auf Doppelseite; Einstellung bleibt gespeichert', async () => {
      const pg = await open(b, D, { logs: false }); await prep(pg);
      await pg.click('#spreadBtn'); await wait(pg, 1000); await pg.click('#nextPage'); await wait(pg);
      await pg.click('#modeDraw'); await wait(pg); let s = await st(pg); eq([s.label, s.c2, s.cls.includes('spread-on')], ['3 / 5', 'none', false]);
      await pg.click('[data-tool=view]'); await wait(pg, 1100); s = await st(pg); eq([s.label, s.c2], ['3–4 / 5', 'block']);
      await pg.reload(); await wait(pg, 1500); ok(await pg.evaluate(() => spreadPref === true), 'Einstellung nach Neuladen');
      await pg.context().close();
    });
    await test('Auftritt: Zonen/Hinweis sichtbar, Blättern in Doppelseiten, Pfeil-Knöpfe, Ende', async () => {
      const pg = await open(b, D, { logs: false }); await prep(pg);
      await pg.click('#spreadBtn'); await wait(pg, 1000); await pg.click('#perfBtn'); await wait(pg, 1500);
      ok(await pg.evaluate(() => document.getElementById('perfHint').classList.contains('show')), 'Hinweis beim Start');
      ok(await pg.isVisible('#pzR') && await pg.isVisible('#pzL'), 'Pfeil-Zonen');
      eq(await pg.evaluate(() => document.getElementById('pzL').classList.contains('off')), true, 'zurück am Anfang gesperrt');
      await pg.keyboard.press('ArrowRight'); await wait(pg); eq((await st(pg)).label, '3–4 / 5');
      await pg.click('#pzR'); await wait(pg); eq((await st(pg)).label, '5 / 5');
      eq(await pg.evaluate(() => document.getElementById('pzR').classList.contains('off')), true, 'weiter am Ende gesperrt (keine Setliste)');
      await pg.click('#pzL'); await wait(pg); eq((await st(pg)).label, '3–4 / 5');
      await pg.mouse.click(640, 400); await wait(pg, 400); await pg.click('#perfHelp'); ok(await pg.evaluate(() => document.getElementById('perfHint').classList.contains('show')), '?-Knopf zeigt Hinweis');
      eq(pg.errs, []); await pg.context().close();
    });
    await test('Auftritt Einzelseite: Tippzone rechts blättert eine Seite, Pfeil-Beschriftung', async () => {
      const pg = await open(b, D, { logs: false }); await prep(pg);
      await pg.click('#perfBtn'); await wait(pg, 1500);
      await pg.mouse.click(1250, 400); await wait(pg); eq((await st(pg)).label, '2 / 5');
      eq(await pg.evaluate(() => document.querySelector('#pzR .pz-t').textContent), 'weiter'); await pg.context().close();
    });
    await test('Text: zwei Spalten; im Auftritt Doppelseiten per Tippen', async () => {
      const pg = await open(b, D, { logs: false }); await prep(pg);
      await pg.click('text=Text >> nth=0'); await wait(pg, 1500); await pg.click('#spreadBtn'); await wait(pg, 700);
      eq(await pg.evaluate(() => getComputedStyle(textSheetEl).columnCount), '2');
      await pg.click('#perfBtn'); await wait(pg, 1500);
      const n = await pg.evaluate(() => tsCount()); ok(n > 1, 'mehrere Doppelseiten: ' + n);
      await pg.keyboard.press('ArrowRight'); await wait(pg, 400);
      eq(await pg.evaluate(() => [tsIdx(), document.getElementById('perfPage').textContent.includes('Doppelseite 2 /')]), [1, true]);
      await pg.keyboard.press('ArrowLeft'); await wait(pg, 400); eq(await pg.evaluate(() => tsIdx()), 0);
      eq(pg.errs, []); await pg.context().close();
    });
  } finally { await b.close(); }
};
