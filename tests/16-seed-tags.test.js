// Einmalige Start-Tags (v2.47.0)
const { launch, open } = require('./fixture.js');
module.exports = async () => {
  const { test, eq, ok } = T;
  const b = await launch(); const D = { width: 1280, height: 800 };
  try {
    await test('Start-Tags: ergänzen, nichts entfernen, nur einmal pro Song', async () => {
      const pg = await open(b, D, { logs: false });
      await pg.evaluate(() => {
        lib.songs.t1 = Object.assign(newSong('Oceandeep', 'Beast in Black'), { tg: ['Eigen'] });
        lib.songs.t2 = newSong("Writing's On the Wall", 'Sam Smith');
        lib.songs.t3 = newSong('Unbekannt', 'X');
        migrateSongs();
      });
      const g = (id) => pg.evaluate((i) => ({ tg: lib.songs[i].tg.slice(), ts: lib.songs[i].ts || 0 }), id);
      eq(await g('t1'), { tg: ['Eigen', 'Metal', 'Ballade'], ts: 1 });
      eq((await g('t2')).tg, ['Pop', 'Ballade']);
      eq(await g('t3'), { tg: [], ts: 0 });
      // Nutzer entfernt einen Tag → bleibt entfernt
      await pg.evaluate(() => { lib.songs.t1.tg = lib.songs.t1.tg.filter(t => t !== 'Ballade'); migrateSongs(); });
      eq((await g('t1')).tg, ['Eigen', 'Metal']);
      ok(!(await pg.evaluate(() => Object.values(lib.songs).some(s => (s.tg || []).includes('Uptempo')))), 'kein Uptempo');
      eq(pg.errs, []); await pg.context().close();
    });
  } finally { await b.close(); }
};
