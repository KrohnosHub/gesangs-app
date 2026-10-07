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
    await test('Zeichnen behält die Doppelseite; Einstellung bleibt gespeichert', async () => {
      const pg = await open(b, D, { logs: false }); await prep(pg);
      await pg.click('#spreadBtn'); await wait(pg, 1000); await pg.click('#nextPage'); await wait(pg);
      await pg.click('#modeDraw'); await wait(pg); let s = await st(pg); eq([s.label, s.c2, s.cls.includes('spread-on')], ['3–4 / 5', 'block', true]);
      await pg.click('[data-tool=view]'); await wait(pg, 600); s = await st(pg); eq([s.label, s.c2], ['3–4 / 5', 'block']);
      await pg.reload(); await wait(pg, 1500); ok(await pg.evaluate(() => spreadPref === true), 'Einstellung nach Neuladen');
      await pg.context().close();
    });
    await test('Doppelseite: Zeichnen, Radieren, Auswählen und Rückgängig auf linker UND rechter Seite', async () => {
      const pg = await open(b, D, { logs: false }); await prep(pg);
      await pg.click('#spreadBtn'); await wait(pg, 1000); await pg.click('#nextPage'); await wait(pg, 1000);
      await pg.click('#modeDraw'); await wait(pg, 300);
      const rect = (id) => pg.evaluate((i) => { const r = document.getElementById(i).getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width, h: r.height }; }, id);
      const stroke = async (id, fx, fy, tx, ty) => { const r = await rect(id); await pg.mouse.move(r.l + r.w * fx, r.t + r.h * fy); await pg.mouse.down(); await pg.mouse.move(r.l + r.w * (fx + tx) / 2, r.t + r.h * (fy + ty) / 2, { steps: 5 }); await pg.mouse.move(r.l + r.w * tx, r.t + r.h * ty, { steps: 5 }); await pg.mouse.up(); await wait(pg, 300); };
      const cnt = () => pg.evaluate(() => ({ p3: (annotData.pages['3'] || []).length, p4: (annotData.pages['4'] || []).length, cur: curP(), off: pageOff }));
      await stroke('inkCanvas', .2, .3, .6, .3); eq(await cnt(), { p3: 1, p4: 0, cur: 3, off: 0 });
      await stroke('inkCanvas2', .2, .4, .6, .4); eq(await cnt(), { p3: 1, p4: 1, cur: 4, off: 1 });
      const px = await pg.evaluate(() => { const c = document.getElementById('inkCanvas2'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++; return n; });
      ok(px > 200, 'rechte Ink-Ebene hat Pixel: ' + px);
      await pg.click('#undoBtn'); await wait(pg, 300); eq(await cnt(), { p3: 1, p4: 0, cur: 4, off: 1 });
      await pg.click('#undoBtn'); await wait(pg, 300); eq(await cnt(), { p3: 0, p4: 0, cur: 3, off: 0 });
      await stroke('inkCanvas2', .2, .4, .6, .4); await stroke('inkCanvas', .2, .3, .6, .3);
      await pg.click('[data-tool=eraser]'); await wait(pg, 200);
      await stroke('inkCanvas2', .1, .4, .7, .4); eq(await cnt(), { p3: 1, p4: 0, cur: 4, off: 1 });
      await pg.click('#undoBtn'); await wait(pg, 300); eq((await cnt()).p4, 1);
      await pg.click('[data-tool=select]'); await wait(pg, 200);
      let r = await rect('inkCanvas2'); await pg.mouse.click(r.l + r.w * .4, r.t + r.h * .4); await wait(pg, 300);
      ok(await pg.evaluate(() => !!selObj() && curP() === 4), 'Auswahl rechts');
      r = await rect('inkCanvas'); await pg.mouse.click(r.l + r.w * .4, r.t + r.h * .3); await wait(pg, 300);
      ok(await pg.evaluate(() => !!selObj() && curP() === 3), 'Auswahl links, rechte abgewählt');
      await pg.click('[data-tool=view]'); await pg.click('#nextPage'); await wait(pg, 1000); await pg.click('#modeDraw');
      eq(await pg.evaluate(() => [curP(), spreadShown]), [5, true]);
      eq(pg.errs, []); await pg.context().close();
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
    await test('Auftritt: Menü per Maus am oberen Rand / Antippen oben; Verlassen des Vollbilds beendet den Auftritt', async () => {
      const pg = await open(b, D, { logs: false }); await prep(pg);
      await pg.click('#perfBtn'); await wait(pg, 1500);
      const shown = () => pg.evaluate(() => document.getElementById('perfUI').classList.contains('show'));
      await pg.evaluate(() => setPerfBar(false)); await wait(pg, 300); eq(await shown(), false);
      ok(await pg.isVisible('#pzTop'), '«Menü»-Knopf bei verstecktem Menü');
      await pg.mouse.move(640, 300); await pg.mouse.move(640, 10); await wait(pg, 300); eq(await shown(), true, 'Maus oben');
      await pg.evaluate(() => setPerfBar(false)); await wait(pg, 300);
      await pg.mouse.click(300, 15); await wait(pg, 300); eq(await shown(), true, 'oberen Rand antippen');
      const fs = await pg.evaluate(async () => { try { await document.documentElement.requestFullscreen(); await new Promise(r => setTimeout(r, 400)); return !!document.fullscreenElement; } catch (e) { return false; } });
      if (fs) { await pg.evaluate(() => document.exitFullscreen()); await wait(pg, 600); eq(await pg.evaluate(() => perf), false, 'Auftritt nach Vollbild-Ende'); }
      eq(pg.errs, []); await pg.context().close();
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
