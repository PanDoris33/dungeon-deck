/* Dungeon Deck: offline cache. Change VERSION at every release so players get the new files. */
const VERSION='dd-v25-1';
const FILES=["./", "index.html", "fonts.css", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "icons/icon-180.png", "fonts/im-fell-english-latin-400-italic.woff2", "fonts/im-fell-english-latin-400-normal.woff2", "fonts/pirata-one-latin-400-normal.woff2"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==VERSION).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>{
    const net=fetch(r).then(res=>{if(res&&res.ok){const c=res.clone();caches.open(VERSION).then(x=>x.put(r,c))}return res}).catch(()=>hit||(r.mode==='navigate'?caches.match('index.html'):undefined));
    return hit||net;
  }));
});
