// Erscheinungsbild: Paletten, Dunkelmodus, Songliste (v2.35.0)
const { launch, open } = require('./fixture.js');
module.exports = async () => {
  const { test, eq, ok } = T;
  const b = await launch();
  const lum = (c) => { const m = c.match(/[\d.]+/g).map(Number); const f = m.slice(0, 3).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * f[0] + .7152 * f[1] + .0722 * f[2]; };
  const cr = (a, c) => { const x = lum(a), y = lum(c), [h, l] = x > y ? [x, y] : [y, x]; return (h + .05) / (l + .05); };
  try {
    await test('Paletten × Modus: Kontraste (Kopfzeile, Akzentfläche, Text, Karten) ≥ WCAG AA', async () => {
      for (const pal of ['bordeaux', 'petrol']) for (const mode of ['light', 'dark']) {
        const pg = await open(b, { width: 1280, height: 760 }, { logs: false, init: `localStorage.setItem('gapp_pal','${pal}');localStorage.setItem('gapp_mode','${mode}');` });
        const c = await pg.evaluate(() => { const g = (el, p) => getComputedStyle(el)[p]; const h = document.querySelector('header'), btn = document.getElementById('newSongBtn'), card = document.querySelector('#fileList .file-item:not(.folder-item)');
          return { hdrBg: g(h, 'backgroundColor'), hdrFg: g(h.querySelector('h1'), 'color'), btnBg: g(btn, 'backgroundColor'), btnFg: g(btn, 'color'), cardBg: g(card, 'backgroundColor'), cardFg: g(card.querySelector('.name'), 'color'), pal: document.documentElement.dataset.pal, scheme: g(document.documentElement, 'colorScheme'), appBg: g(document.body, 'backgroundColor'), sig: document.querySelector('header .primary') ? g(document.querySelector('header .primary'), 'backgroundColor') + '|' + g(document.querySelector('header .primary'), 'color') : null }; });
        const tag = pal + '/' + mode + ' ' + JSON.stringify(c);
        eq(c.pal, pal); ok(c.scheme.includes(mode), 'color-scheme ' + tag);
        ok(cr(c.hdrBg, c.hdrFg) >= 4.5, 'Kopfzeile ' + cr(c.hdrBg, c.hdrFg).toFixed(1) + ' ' + tag);
        ok(cr(c.btnBg, c.btnFg) >= 4.5, 'Akzent-Knopf ' + cr(c.btnBg, c.btnFg).toFixed(1) + ' ' + tag);
        ok(cr(c.cardBg, c.cardFg) >= 7, 'Karte ' + cr(c.cardBg, c.cardFg).toFixed(1) + ' ' + tag);
        if (c.sig) { const [bg, fg] = c.sig.split('|'); ok(cr(bg, fg) >= 4.5, 'Anmelden ' + tag); }
        eq(pg.errs, []); await pg.context().close();
      }
    });
    await test('Einstellungen: Palette/Modus umschalten wirkt sofort, bleibt nach Neustart, Auto folgt dem Gerät', async () => {
      const pg = await open(b, { width: 1280, height: 760 }, { logs: false });
      const st = () => pg.evaluate(() => ({ pal: document.documentElement.dataset.pal, mode: document.documentElement.dataset.mode, hdr: getComputedStyle(document.querySelector('header')).backgroundColor, meta: document.querySelector('meta[name="theme-color"]').content }));
      const a = await st(); eq([a.pal, a.mode], ['bordeaux', 'auto']);
      await pg.click('#settingsBtn'); await pg.waitForTimeout(300);
      await pg.click('.theme-box button[data-pal="petrol"]'); await pg.click('.theme-box button[data-mode="dark"]'); await pg.waitForTimeout(200);
      const c = await st(); eq([c.pal, c.mode], ['petrol', 'dark']); ok(c.hdr !== a.hdr, 'Kopfzeile ändert die Farbe'); ok(/^#/.test(c.meta) && c.meta.toLowerCase() === '#0f3a40', 'Browserleiste: ' + c.meta);
      await pg.reload(); await pg.waitForTimeout(800);
      eq((await st()).pal + '/' + (await st()).mode, 'petrol/dark');
      await pg.evaluate(() => { rawSet('gapp_mode', 'auto'); applyTheme(); });
      await pg.emulateMedia({ colorScheme: 'dark' }); await pg.waitForTimeout(200);
      ok((await pg.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).includes('dark'), 'Automatisch + Gerät dunkel');
      await pg.emulateMedia({ colorScheme: 'light' }); await pg.waitForTimeout(200);
      ok((await pg.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).includes('light'), 'Automatisch + Gerät hell');
      eq(pg.errs, []); await pg.context().close();
    });
    await test('Songliste: Karten, Gruppenköpfe (Buchstabe/Interpret/Zeitraum), Ordner-Badge, Tag-Chips (max. 2 + «+n»)', async () => {
      const pg = await open(b, { width: 1280, height: 760 }, { logs: false });
      await pg.evaluate(() => { const t = Date.now(); for (const [id, n, ar, lo] of [['s4', 'Halleluja', 'Leonard Cohen', t], ['s5', 'Imagine', 'John Lennon', t - 3 * 864e5], ['s6', 'Yesterday', 'The Beatles', 0]]) lib.songs[id] = { n, ar, f: null, sheets: [], tg: [], fv: 0, u: t, lo, audio: [], links: [] }; sTouch('s1', s => { s.tg = ['A', 'B', 'C', 'D']; }); renderSidebar(); });
      const heads = () => pg.evaluate(() => [...document.querySelectorAll('#fileList .group-head')].map(e => e.textContent));
      eq(await heads(), ['A', 'H', 'I', 'S', 'Y']);
      await pg.selectOption('#sortSel', 'artist'); eq(await heads(), ['John Lennon', 'Leonard Cohen', 'The Beatles', 'Ohne Interpret']);
      await pg.selectOption('#sortSel', 'opened'); const o = await heads(); ok(o[0] === 'Heute' && o.includes('Diese Woche') && o.includes('Noch nie geöffnet'), JSON.stringify(o));
      await pg.selectOption('#sortSel', 'name');
      const chips = await pg.evaluate(() => { const it = [...document.querySelectorAll('#fileList .file-item')].find(e => e.textContent.includes('Sound of Silence')); return [...it.querySelectorAll('.tagchip')].map(e => e.textContent); });
      eq(chips, ['A', 'B', '+2']);
      const f = await pg.evaluate(() => { const el = document.querySelector('#fileList .folder-item'); return [!!el.querySelector('.count-badge'), getComputedStyle(el).borderLeftWidth]; });
      eq(f, [true, '3px']);
      ok(await pg.evaluate(() => { const a = document.querySelector('#fileList .file-item:not(.folder-item)'); return parseFloat(getComputedStyle(a).borderTopLeftRadius) >= 8 && getComputedStyle(a).marginBottom !== '0px'; }), 'Kartenstil');
      eq(pg.errs, []); await pg.context().close();
    });
  } finally { await b.close(); }
};
