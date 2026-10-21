// Teilen mit Audio (v2.52.0): Backing standardmässig, Aufnahmen/Melodie nur per Haken
const { launch, open } = require('./fixture.js');
module.exports = async () => {
  const { test, eq, ok } = T;
  const b = await launch();
  try {
    await test('Teilen: Backing mit, Aufnahmen/Melodie nur auf Wunsch; Dialog mit Haken', async () => {
      const pg = await open(b, { width: 1280, height: 800 }, { logs: false });
      await pg.evaluate(() => {
        window.__up = [];
        driveCreateFolder = async () => 'FOLD1'; driveListChildren = async () => []; driveTrashId = async () => {}; driveAddPermission = async () => {};
        isOwnShareFolder = async () => false; sheetPdfBytes = async () => new Uint8Array([1]); songInfoText = async () => null;
        loadAudioBlob = async (a) => new Blob(['x'], { type: a.name === 'take1' ? 'audio/webm' : 'audio/mpeg' });
        uploadMultipart = async (f, m) => { window.__up.push(m.name); return { id: 'x' }; }; uploadResumable = uploadMultipart;
        lib.songs.t1 = Object.assign(newSong('Testlied', 'A'), { sheets: [], audio: [{ id: 'a1', name: 'play.mp3', kind: 'backing' }, { id: 'a2', name: 'take1', kind: 'take' }, { id: 'a3', name: 'mel.mid', kind: 'ref' }], ref: { id: 'a3', name: 'mel.mid' } });
      });
      const run = (o) => pg.evaluate(async (o) => { window.__up = []; const r = await runShare(shareTarget('song', 't1'), Object.assign({ email: '', link: true, annot: false }, o), () => {}); return { up: window.__up.slice(), audio: r.audio, failed: r.failed }; }, o);
      eq(await run({ backing: true }), { up: ['Testlied – Backing – play.mp3'], audio: 1, failed: [] });
      eq((await run({})).up, []);
      eq((await run({ backing: true, takes: true, ref: true })).up, ['Testlied – Backing – play.mp3', 'Testlied – Aufnahme – take1.webm', 'Testlied – Melodie – mel.mid']);
      // Dialog: Haken-Zustände
      await pg.evaluate(() => shareDialog('song', 't1')); await pg.waitForTimeout(300);
      const st = await pg.evaluate(() => { const f = (t) => { const l = [...document.querySelectorAll('.modal label')].find(x => x.textContent.includes(t) && x.querySelector('input[type=checkbox]')); return l ? l.querySelector('input').checked : null; }; return [f('Backing-Tracks mitsenden'), f('Referenzmelodie mitsenden'), f('Meine Aufnahmen mitsenden')]; });
      eq(st, [true, false, false]);
      eq(pg.errs, []); await pg.context().close();
    });
  } finally { await b.close(); }
};
