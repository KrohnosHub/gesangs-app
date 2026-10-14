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
      eq(await pg.evaluate(() => window.__d.slice(-1)[0]), 1.5);            // Standarddauer 1,5 s
      await pg.evaluate(() => { const i = document.querySelector('#pianoPanel .pk-opts input'); i.value = '3'; i.dispatchEvent(new Event('input')); });
      await pg.click('#pianoPanel .pk-w[data-m="62"]'); eq(await pg.evaluate(() => window.__d.slice(-1)[0]), 3);
      await pg.click('#pianoPanel .pk-opts button');                         // Haltemodus: lange Dauer, Ausklingen beim Loslassen
      await pg.click('#pianoPanel .pk-w[data-m="64"]'); eq(await pg.evaluate(() => window.__d.slice(-1)[0]), 30);
      ok(await pg.evaluate(() => PK.cfg.hold && document.querySelector('#pianoPanel .pk-opts input').disabled), 'Regler im Haltemodus gesperrt');
      await pg.click('#pianoPanel .pk-opts button');
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
