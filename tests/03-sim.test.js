// Entwicklermodus «Neuen Nutzer simulieren» (?sim=NAME): Isolation von den echten Daten
const { launch, open } = require('./fixture.js');
module.exports = async () => {
  const { test, eq, ok } = T;
  const b = await launch(); const D = { width: 1280, height: 800 };
  try {
    await test('Normalmodus: kein Sim-Banner, Standard-Datenbank', async () => {
      const pg = await open(b, D, { logs: false });
      eq(await pg.evaluate(() => [!!document.getElementById('simBar'), idbName()]), [false, 'gesangs-app']); await pg.context().close();
    });
    await test('Sim: leere Bibliothek, Banner, eigene DB – echte Daten unsichtbar und unberührt', async () => {
      const pg = await open(b, D, { logs: false });                      // echte Daten im selben Browser-Kontext
      const ctx = pg.context(); eq(await pg.evaluate(() => Object.keys(lib.songs).length), 3);
      const sp = await ctx.newPage(); sp.errs = []; sp.on('pageerror', e => sp.errs.push(e.message));
      await sp.route(/accounts\.google\.com|apis\.google|googleapis|youtube|spotify|lrclib|lyrics\.ovh/, r => r.abort());
      await sp.goto(process.env.BASE + '?sim=t1'); await sp.waitForTimeout(1200);
      eq(await sp.evaluate(() => [!!document.getElementById('simBar'), idbName(), Object.keys(lib.songs).length, document.title.includes('t1')]), [true, 'gesangs-app-sim-t1', 0, true]);
      await sp.evaluate(() => { lsSet('probe', '1'); });
      ok(await sp.evaluate(() => localStorage.getItem('sim_t1_probe') === '1' && localStorage.getItem('probe') === null), 'LS-Präfix');
      ok(await sp.waitForSelector('.modal-bg', { timeout: 5000 }).then(() => true).catch(() => false), 'Kurzanleitung beim Erststart');
      eq(sp.errs, []);
      eq((await pg.evaluate(async () => Object.keys((await IDB.get('kv', 'lib')).lib.songs).length)), 3, 'echte Bibliothek unberührt');
      await ctx.close();
    });
    await test('Sim: «Zurücksetzen» löscht DB und Schlüssel, echte Daten bleiben', async () => {
      const pg = await open(b, D, { logs: false }); const ctx = pg.context();
      const sp = await ctx.newPage(); sp.on('dialog', d => d.accept());
      await sp.route(/accounts\.google\.com|apis\.google|googleapis|youtube|spotify|lrclib|lyrics\.ovh/, r => r.abort());
      await sp.goto(process.env.BASE + '?sim=t2'); await sp.waitForTimeout(1000);
      await sp.evaluate(async () => { lib.songs.x = { n: 'Test', sheets: [], tg: [], u: 1 }; await IDB.put('kv', 'lib', { lib, libDirty: false }); lsSet('probe', '1'); });
      await sp.click('#simBar >> text=Zurücksetzen'); await sp.waitForTimeout(1500);
      eq(await sp.evaluate(() => [Object.keys(lib.songs).length, localStorage.getItem('sim_t2_probe')]), [0, null]);
      eq(await pg.evaluate(async () => Object.keys((await IDB.get('kv', 'lib')).lib.songs).length), 3, 'echte Daten'); await ctx.close();
    });
    await test('Einstellungen: Entwickler-Checkbox zeigt Simulations-Dialog; Sim-Name wird gespeichert', async () => {
      const pg = await open(b, D, { logs: false });
      const r = await pg.evaluate(() => { rawSet('gapp_dev', '1'); openSettingsDialog(); const btn = [...document.querySelectorAll('button')].find(x => x.textContent.includes('Neuen Nutzer simulieren')); btn && btn.click(); return !!document.querySelector('input[maxlength="24"]'); });
      ok(r, 'devDialog nicht geöffnet'); eq(pg.errs, []); await pg.context().close();
    });
    await test('Sim-Name wird bereinigt (Pfad-/Sonderzeichen)', async () => {
      const pg = await open(b, D, { logs: false, query: '?sim=a%2Fb<c>d' });
      eq(await pg.evaluate(() => SIM), 'abcd'); await pg.context().close();
    });
  } finally { await b.close(); }
};
