// Verknüpfung bearbeiten (Name + Kategorie) und Aufnahme-Ansicht: kein Autostart, Tempo/Tonhöhe vorab (v2.26.0)
const { launch, open } = require('./fixture.js');
module.exports = async () => {
  const { test, eq, ok } = T;
  const b = await launch(); const D = { width: 1280, height: 800 };
  try {
    await test('Verknüpfung bearbeiten: Name und Kategorie in einem Dialog, kein «→ 🎧»-Knopf mehr', async () => {
      const pg = await open(b, D, { logs: false });
      await pg.evaluate(() => manageLinks(Object.assign({ id: 's1' }, lib.songs.s1))); await pg.waitForTimeout(400);
      eq(await pg.evaluate(() => [...document.querySelectorAll('.link-manage .pick-row button')].map(x => x.title).filter(t => /Kategorie/.test(t) && /verschieben/.test(t)).length), 0);
      await pg.click('.link-manage .pick-row button[title^="Bearbeiten"]'); await pg.waitForTimeout(300);
      const M = '.modal-bg:last-child .modal';
      await pg.fill(M + ' input[type=text]', 'Neuer Name'); await pg.selectOption(M + ' select', 'karaoke');
      await pg.click(M + ' .btns button.primary'); await pg.waitForTimeout(400);
      eq(await pg.evaluate(() => { const l = lib.songs.s1.links[0]; return [l.title, l.kind]; }), ['Neuer Name', 'karaoke']);
      eq(await pg.evaluate(() => document.querySelector('.link-manage').textContent.includes('Neuer Name')), true);
      eq(pg.errs, []); await pg.context().close();
    });
    await test('Aufnahme: Backing startet nicht beim Öffnen; Tempo/Tonhöhe vorab; Start mit Aufnahme', async () => {
      const pg = await open(b, D, {
        logs: false, init: () => { navigator.mediaDevices.getUserMedia = async () => { const c = new AudioContext(); const o = c.createOscillator(); const d = c.createMediaStreamDestination(); o.connect(d); o.start(); return d.stream; }; }
      });
      await pg.evaluate(async () => {
        const sr = 22050, n = sr * 4, v = new Float32Array(n); for (let i = 0; i < n; i++) v[i] = 0.3 * Math.sin(2 * Math.PI * 220 * i / sr);
        const blob = encodeWav([v], sr), buf = await blob.arrayBuffer();
        await IDB.put('blobs', 'bk1', { buf, mime: 'audio/wav', md5: 'z', name: 'bk.wav', dirty: 0 });
        addAudio('s1', { id: 'bk1', name: 'Mein Backing', kind: 'backing' });
        openRecorder(Object.assign({ id: 's1' }, lib.songs.s1));
      });
      await pg.waitForTimeout(800);
      eq(await pg.evaluate(() => [mpCurrentId(), !!mp.audioEl]), [null, false]);
      const btn = (t) => pg.click('.recorder button[title="' + t + '"]');
      await btn('Backing zum Ausprobieren abspielen'); await pg.waitForTimeout(1200);
      ok(await pg.evaluate(() => !mp.audioEl.paused && mp.audioEl.currentTime > 0.3), 'Vorhören spielt unabhängig von der Aufnahme');
      await btn('Backing zum Ausprobieren abspielen'); await pg.waitForTimeout(400);
      ok(await pg.evaluate(() => mp.audioEl.paused), 'Vorhören pausiert');
      await btn('Schneller'); await btn('Schneller'); await pg.waitForTimeout(500);
      let s = await pg.evaluate(() => ({ id: mpCurrentId(), paused: mp.audioEl.paused, rate: Math.round(mp.audioEl.playbackRate * 100) }));
      eq(s, { id: 'bk1', paused: true, rate: 110 });
      await btn('Einen Halbton höher'); await btn('Einen Halbton höher');
      await pg.waitForFunction(() => PR.semi === 2 && !/umgerechnet/.test(PR.msg) && mp.audioEl.src !== PR.origUrl, null, { timeout: 30000 });
      ok(await pg.evaluate(() => mp.audioEl.paused), 'bleibt pausiert');
      ok(await pg.evaluate(() => document.querySelector('.recorder').textContent.includes('110 %') && document.querySelector('.recorder').textContent.includes('+2 HT')), 'Anzeige');
      await pg.click('.recorder .primary'); await pg.waitForTimeout(1500);
      s = await pg.evaluate(() => ({ paused: mp.audioEl.paused, t: mp.audioEl.currentTime, rate: Math.round(mp.audioEl.playbackRate * 100), semi: PR.semi }));
      ok(!s.paused && s.t > 0.3 && s.t < 3 && s.rate === 110 && s.semi === 2, JSON.stringify(s));
      await pg.click('.recorder .danger'); await pg.waitForTimeout(500);
      eq(pg.errs, []); await pg.context().close();
    });
  } finally { await b.close(); }
};
