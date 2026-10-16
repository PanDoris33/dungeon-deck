/* Dungeon Deck: offline cache. Change VERSION at every release so players get the new files. */
const VERSION='dd-v26-1';
const FILES=["./", "index.html", "fonts.css", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "icons/icon-180.png", "fonts/im-fell-english-latin-400-italic.woff2", "fonts/im-fell-english-latin-400-normal.woff2", "fonts/pirata-one-latin-400-normal.woff2"];
const MARK='update-ready';
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==VERSION).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
async function tell(){const cl=await self.clients.matchAll({includeUncontrolled:true});cl.forEach(x=>x.postMessage({type:'update'}))}
self.addEventListener('message',e=>{if(e.data&&e.data.type==='check'){e.waitUntil(caches.open(VERSION).then(c=>c.match(MARK)).then(m=>{if(m&&e.source)e.source.postMessage({type:'update'})}))}});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>{
    const old=hit&&hit.clone();
    const net=fetch(r).then(async res=>{
      if(res&&res.ok){
        const cache=await caches.open(VERSION),c=res.clone();
        if(r.mode==='navigate'&&hit){try{const a=await old.text(),b=await res.clone().text();
          if(a!==b){await cache.put(MARK,new Response('1'));tell()}else{await cache.delete(MARK)}}catch(_){}}
        await cache.put(r,c)
      }
      return res}).catch(()=>hit||(r.mode==='navigate'?caches.match('index.html'):undefined));
    if(hit)e.waitUntil(net.catch(()=>{}));
    return hit||net;
  }));
});
