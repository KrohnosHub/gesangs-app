// Virtuelle Klaviatur (v2.27.0)
const { launch, open } = require('./fixture.js');
module.exports = async () => {
  const { test, eq, ok } = T;
  const b = await launch();
  try {
    await test('Klaviatur: Taste P, Knopf, Menü; Tasten per Maus und Computertastatur; Oktaven', async () => {
      const pg = await open(b, { width: 1280, height: 800 }, { logs: false });
      await pg.evaluate(() => { window.__n = []; const o = window.synthNote; window.__d = []; window.synthNote = (c, m, ...r) => { window.__n.push(m); window.__d.push(r[1]); return o(c, m, ...r); }; });
      const vis = () => pg.evaluate(() => { const e = document.getElementById('pianoPanel'); return !!e && getComputedStyle(e).display !== 'none'; });
      eq(await vis(), false);
      await pg.keyboard.press('p'); await pg.waitForTimeout(200); eq(await vis(), true);
      eq(await pg.evaluate(() => document.querySelectorAll('#pianoPanel .pk-w').length), 15);
      await pg.click('#pianoPanel .pk-w[data-m="60"]'); await pg.waitForTimeout(100);
      eq(await pg.evaluate(() => [window.__n.slice(-1)[0], document.querySelector('#pianoPanel .pk-name').textContent]), [60, 'C4 · 261.6 Hz']);
      const r = await pg.evaluate(() => { const r = document.querySelector('#pianoPanel .pk-b[data-m="61"]').getBoundingClientRect(); return [r.left + r.width / 2, r.top + 10]; });
      await pg.mouse.click(r[0], r[1]); await pg.waitForTimeout(100); eq(await pg.evaluate(() => window.__n.slice(-1)[0]), 61);
      // Dynamische Dauer: kurzes Antippen = Mindestdauer (1,5 s), langes Drücken = so lange wie gedrückt
      let d = await pg.evaluate(() => PK.last.relAt - PK.last.t0); ok(d >= 1400 && d <= 1700, 'Antippen: ' + d);
      const r2 = await pg.evaluate(() => { const r = document.querySelector('#pianoPanel .pk-w[data-m="64"]').getBoundingClientRect(); return [r.left + r.width / 2, r.bottom - 8]; });
      await pg.mouse.move(r2[0], r2[1]); await pg.mouse.down(); await pg.waitForTimeout(2400); await pg.mouse.up(); await pg.waitForTimeout(100);
      d = await pg.evaluate(() => PK.last.relAt - PK.last.t0); ok(d >= 2300 && d <= 2800, 'Halten: ' + d);
      await pg.evaluate(() => { const i = document.querySelector('#pianoPanel .pk-opts input'); i.value = '0.2'; i.dispatchEvent(new Event('input')); });
      await pg.click('#pianoPanel .pk-w[data-m="62"]'); d = await pg.evaluate(() => PK.last.relAt - PK.last.t0); ok(d <= 400, 'kurze Mindestdauer: ' + d);
      await pg.evaluate(() => { const i = document.querySelector('#pianoPanel .pk-opts input'); i.value = '1.5'; i.dispatchEvent(new Event('input')); });
      await pg.keyboard.press('y'); await pg.keyboard.press('q'); await pg.waitForTimeout(100);
      eq(await pg.evaluate(() => window.__n.slice(-2)), [48, 60]);
      await pg.click('#pianoPanel button[title="Eine Oktave höher"]'); await pg.click('#pianoPanel button[title="Mehr Oktaven"]'); await pg.waitForTimeout(100);
      eq(await pg.evaluate(() => [document.querySelectorAll('#pianoPanel .pk-w').length, document.querySelector('#pianoPanel .pk-w').dataset.m]), [22, '60']);
      await pg.keyboard.press('p'); await pg.waitForTimeout(100); eq(await vis(), false);
      await pg.click('#pianoBtn'); await pg.waitForTimeout(100); eq(await vis(), true);
      await pg.click('#pianoPanel button[title^="Schliessen"]'); eq(await vis(), false);
      await pg.evaluate(() => $('moreMenuBtn').click()); await pg.waitForTimeout(200);
      await pg.evaluate(() => [...document.querySelectorAll('.modal button, .modal .pick-row, .modal .menu-item, .modal-bg *')].find(e => e.textContent.trim().startsWith('🎹 Klaviatur') && !e.children.length).click()); await pg.waitForTimeout(200);
      eq(await vis(), true);
      eq(pg.errs, []); await pg.context().close();
    });
    await test('Klaviersamples: laden, Töne aller Lagen werden aus Samples gespielt, Lizenzdatei vorhanden', async () => {
      const pg = await open(b, { width: 1280, height: 800 }, { logs: false });
      await pg.keyboard.press('p'); await pg.click('#pianoPanel .pk-w[data-m="60"]');
      await pg.waitForFunction(() => PIANO_SMP.state === 2, null, { timeout: 20000 });
      eq(await pg.evaluate(() => [PIANO_SMP.buf.size, [...PIANO_SMP.buf.keys()].sort((a, b) => a - b)[0], Math.max(...PIANO_SMP.buf.keys())]), [21, 36, 96]);
      const used = await pg.evaluate(() => { let n = 0; const c = new AudioContext(), o = c.createBufferSource.bind(c); c.createBufferSource = () => { n++; return o(); }; [30, 48, 61, 72, 100].forEach(m => synthNote(c, m, c.currentTime, 0.5)); return n; });
      eq(used, 5);                                                // jeder Ton über Sample (nicht über das Synthesemodell)
      eq((await (await pg.request.get(pg.url().replace(/index\.html.*/, '') + 'samples/piano/LICENSE.txt')).text()).includes('CC BY 3.0'), true);
      eq(pg.errs, []); await pg.context().close();
    });
    await test('Klaviatur: im Auftrittsmodus und über einem Dialog benutzbar; Mini-Player rückt hoch', async () => {
      const pg = await open(b, { width: 1280, height: 800 }, { logs: false });
      await pg.evaluate(() => [...document.querySelectorAll('.name')].find(e => e.textContent === 'Sound of Silence').click()); await pg.waitForTimeout(1200);
      await pg.evaluate(() => $('perfBtn').click()); await pg.waitForTimeout(500);
      await pg.mouse.move(640, 5); await pg.waitForTimeout(300);
      await pg.click('#perfPiano'); await pg.waitForTimeout(200);
      eq(await pg.evaluate(() => getComputedStyle(document.getElementById('pianoPanel')).display), 'flex');
      const bt = await pg.evaluate(() => { const r = document.querySelector('#pianoPanel').getBoundingClientRect(); return [Math.round(r.bottom), innerHeight]; });
      eq(bt[0], bt[1]);
      await pg.click('#pianoPanel .pk-w[data-m="55"]');
      ok(await pg.evaluate(() => document.querySelector('#pianoPanel .pk-name').textContent.startsWith('G3')), 'Note G3');
      eq(pg.errs, []); await pg.context().close();
    });
  } finally { await b.close(); }
};
