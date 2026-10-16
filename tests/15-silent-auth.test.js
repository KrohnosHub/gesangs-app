// Stille Anmeldung im Hintergrund (v2.44.0)
const { launch, open } = require('./fixture.js');
module.exports = async () => {
  const { test, eq, ok } = T;
  const b = await launch(); const D = { width: 1280, height: 800 };
  try {
    await test('Stille Anmeldung: prompt none + Hinweis, Erfolg setzt Token; Fehler → Pause, kein Absturz', async () => {
      const pg = await open(b, D, { logs: false });
      await pg.evaluate(() => {
        window.__calls = []; window.__mode = 'ok';
        window.google = { accounts: { oauth2: { initTokenClient(cfg) { window.__cfg = cfg; return { requestAccessToken(o) { window.__calls.push(o); setTimeout(() => { if (window.__mode === 'ok') cfg.callback({ access_token: 'tok1', expires_in: 3600 }); else cfg.error_callback({ type: 'popup_failed_to_open' }); }, 10); } }; } } } };
        initAuth(); lsSet('gapp_hadlogin', '1'); lsSet('gapp_hint', 'a@b.ch'); dropToken();
        window.syncAll = async () => {}; window.rememberHint = async () => {};
      });
      eq(await pg.evaluate(() => trySilentToken()), true);
      eq(await pg.evaluate(() => [window.__calls[0].prompt, window.__calls[0].hint, tokenValid()]), ['none', 'a@b.ch', true]);
      eq(await pg.evaluate(() => trySilentToken()), false);                               // Token gültig → nichts zu tun
      // Token läuft bald ab → erneuert
      await pg.evaluate(() => { tokenExpiry = Date.now() + 60000; });
      eq(await pg.evaluate(() => trySilentToken()), true); eq(await pg.evaluate(() => window.__calls.length), 2);
      // Browser blockiert das Fenster → false, Pause (kein zweiter Versuch), App bleibt benutzbar
      await pg.evaluate(() => { window.__mode = 'fail'; dropToken(); });
      eq(await pg.evaluate(() => trySilentToken()), false);
      eq(await pg.evaluate(() => trySilentToken()), false); eq(await pg.evaluate(() => window.__calls.length), 3);
      // ohne frühere Anmeldung nie
      await pg.evaluate(() => { lsDel('gapp_hadlogin'); lsDel('gapp_folderId'); silentFailUntil = 0; });
      eq(await pg.evaluate(() => trySilentToken()), false); eq(await pg.evaluate(() => window.__calls.length), 3);
      eq(pg.errs, []); await pg.context().close();
    });
  } finally { await b.close(); }
};
