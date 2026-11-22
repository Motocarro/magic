// Uso: node cifra.js   (Node 18+)  ->  legge in_chiaro/dati.json e scrive:
//   pacchetto.json (fascicolo, aperto dal codice cancello), intel.json (frammenti+finale, codice intelligence),
//   m0.json, m1.json... (un file cifrato per ogni foto/video dei capi d'accusa, scaricati solo al click)
// AES-256-GCM, chiave da PBKDF2-SHA256 (200k iterazioni). Il link del video si apre con le 4 risposte dei frammenti.
const fs=require('fs'),path=require('path'),{webcrypto:{subtle},randomBytes,createHash}=require('crypto');
const D='in_chiaro',ITER=200000;
const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const gate=s=>norm(s).replace(/^(prova)?n?(?=\d)/,''); // "PROVA N. 1664", "n1664", "1664" -> "1664"
const h=s=>createHash('sha256').update('v1:'+norm(s)).digest('hex');
const b64=b=>Buffer.from(b).toString('base64');
const red=o=>JSON.parse(JSON.stringify(o),(k,v)=>typeof v=='string'?v.replace(/\[\[(.+?)\]\]/g,(_,t)=>'⟦'+[...t].length+'⟧'):v); // [[testo]] -> barra nera, il testo NON finisce nel pacchetto
const mime={'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.gif':'image/gif','.mp4':'video/mp4','.webm':'video/webm'};
const uri=f=>{const e=path.extname(f).toLowerCase();if(!mime[e])throw Error('Formato non supportato: '+f);
  return 'data:'+mime[e]+';base64,'+fs.readFileSync(path.join(D,f)).toString('base64')};
async function enc(obj,pass){
  const s=randomBytes(16),i=randomBytes(12);
  const k0=await subtle.importKey('raw',Buffer.from(pass),'PBKDF2',false,['deriveKey']);
  const k=await subtle.deriveKey({name:'PBKDF2',salt:s,iterations:ITER,hash:'SHA-256'},k0,{name:'AES-GCM',length:256},false,['encrypt']);
  const data=Buffer.isBuffer(obj)?obj:Buffer.from(JSON.stringify(obj));
  return {s:b64(s),i:b64(i),c:b64(await subtle.encrypt({name:'AES-GCM',iv:i},k,data))};
}
const MB=f=>(fs.statSync(f).size/1e6).toFixed(2)+' MB';
(async()=>{
  const d=JSON.parse(fs.readFileSync(path.join(D,'dati.json'),'utf8'));
  const cens=d.campi_censurati, fr=d.frammenti;
  const code2=cens.map(c=>norm(c.risposta)[c.lettera-1]).join('');
  for(const [n,c] of d.capi_accusa.entries()){
    if(!c.file)continue;const e=path.extname(c.file).toLowerCase();if(!mime[e])throw Error('Formato non supportato: '+c.file);
    fs.writeFileSync('m'+n+'.json',JSON.stringify({...await enc(fs.readFileSync(path.join(D,c.file)),code2),t:mime[e]}));
    console.log('m'+n+'.json',MB('m'+n+'.json'),'<-',c.file);
  }
  const l3=await enc({url:d.link_video,ps:d.ps||''},fr.map(f=>norm(f.risposta)).join('|'));
  fs.writeFileSync('intel.json',JSON.stringify(await enc({frammenti:fr.map(f=>({tipo:f.tipo,testo:f.testo,h:h(f.risposta)})),finale:l3},code2)));
  fs.writeFileSync('pacchetto.json',JSON.stringify(await enc({
    scheda:{...red(d.scheda),foto:d.scheda.foto?uri(d.scheda.foto):null},
    censurati:cens.map(c=>({etichetta:c.etichetta,len:norm(c.risposta).length,lettera:c.lettera,h:h(c.risposta)})),
    accuse:d.capi_accusa.map(c=>({titolo:c.titolo,corrotto:!c.file}))},gate(d.codice_cancello))));
  console.log('pacchetto.json',MB('pacchetto.json'),'| intel.json',MB('intel.json'));
  console.log('OK. Codice intelligence:',code2.toUpperCase());
})();
