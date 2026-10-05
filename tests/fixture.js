const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8766/index.html';
async function launch(){ return chromium.launch(process.env.CHROMIUM||require('fs').existsSync('/opt/pw-browsers/chromium')?{executablePath:process.env.CHROMIUM||'/opt/pw-browsers/chromium'}:{}); }
async function open(b, vp, {seed=true, logs=true, init, query='', tour=true}={}){
  const ctx=await b.newContext({viewport:vp, serviceWorkers:'block', hasTouch: vp.width<600, isMobile: vp.width<600});
  const pg=await ctx.newPage(); pg.errs=[];
  pg.on('pageerror',e=>{pg.errs.push(e.message); if(logs) console.log('PAGEERROR',e.message);});
  await pg.route(/accounts\.google\.com|apis\.google|googleapis|youtube|spotify|lrclib|lyrics\.ovh/, r=>r.abort());
  if(tour) await pg.addInitScript(()=>{ try{ if(!sessionStorage.getItem('__t')){ sessionStorage.setItem('__t','1'); localStorage.setItem('gapp_tour','1'); } }catch(e){} });
  if(init) await pg.addInitScript(init);
  await pg.goto(BASE+query); await pg.waitForTimeout(800);
  pg.query=query;
  if(seed){
    await pg.evaluate(async()=>{
      const { PDFDocument, StandardFonts, rgb } = await loadPdfLib();
      const d = await PDFDocument.create(); const f = await d.embedFont(StandardFonts.Helvetica);
      for(let p=0;p<2;p++){ const pgp=d.addPage([595,842]); pgp.drawText('Notenblatt Seite '+(p+1),{x:50,y:790,size:22,font:f}); for(let i=0;i<28;i++) pgp.drawText('Zeile '+(i+1)+' – Beispieltext fuer das Blatt',{x:50,y:750-i*24,size:14,font:f}); }
      const pdf = await d.save(); const ab = pdf.buffer.slice(pdf.byteOffset,pdf.byteOffset+pdf.byteLength);
      const html = '<div class="lyrics-doc" style="font-size:20px;line-height:1.9;"><p class="lbl">Strophe 1</p><p>Hello darkness, my old friend</p><p>I\'ve come to talk with you again</p><p class="ref">Refrain</p><p>And the sound of silence</p></div>';
      const now = new Date().toISOString();
      const fl = [
        {id:'f1',name:'Sound of Silence.pdf',mimeType:'application/pdf',modifiedTime:now,createdTime:now,md5Checksum:'a'},
        {id:'f2',name:'Text.html',mimeType:TXT_MIME,modifiedTime:now,createdTime:now,md5Checksum:'b'},
        {id:'f3',name:'Amazing Grace.pdf',mimeType:'application/pdf',modifiedTime:now,createdTime:now,md5Checksum:'c'}];
      const L = emptyLib(); const t=Date.now();
      L.folders = { fo1:{n:'Pop',p:null,u:t}, fo2:{n:'Klassik',p:null,u:t} };
      L.songs = {
        s1:{n:'Sound of Silence',f:null,sheets:['f1','f2'],tg:['Bariton','Lehrer-Aufgabe'],fv:1,u:t,links:[{id:'l1',type:'yt',kind:'orig',mediaId:'x',title:'Simon & Garfunkel',url:'https://youtu.be/x',u:t}],tasks:[{id:'t1',t:'Atmung Strophe 2',d:'2026-10-07',s:'open',c:'x',u:t}],log:[],audio:[]},
        s2:{n:'Amazing Grace',f:null,sheets:['f3'],tg:['Klassik'],fv:0,u:t,audio:[],links:[]},
        s3:{n:'Halleluja',f:'fo1',sheets:[],tg:[],fv:0,u:t,audio:[],links:[]}
      };
      await IDB.put('kv','lib',{lib:L,libDirty:false,libRemoteId:null,libRemoteTime:null});
      await IDB.put('kv','files',fl);
      await IDB.put('blobs','f1',{buf:ab,mime:'application/pdf',md5:'a',name:fl[0].name,dirty:0});
      await IDB.put('blobs','f3',{buf:ab.slice(0),mime:'application/pdf',md5:'c',name:fl[2].name,dirty:0});
      await IDB.put('blobs','f2',{buf:textBuf(html),mime:TXT_MIME,md5:'b',name:'Text.html',dirty:0});
    });
    await pg.reload(); await pg.waitForTimeout(1000);
  }
  pg.names=()=>pg.evaluate(()=>[...document.querySelectorAll('#fileList .file-item .name')].map(e=>e.textContent).filter(n=>n!=='Pop'&&n!=='Klassik'));  // ohne Ordner
  pg.shot = (n)=>pg.screenshot({path:''+(process.env.SHOT_DIR||'/tmp')+'/'+n+'.png'});
  return pg;
}
module.exports={launch,open};
