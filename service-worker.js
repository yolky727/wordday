/* WORDDAY 2.2 · theme, profile and achievements */
const CACHE_NAME = 'wordday-v2.2-theme-achievement';
const CACHE_PREFIX = 'wordday-';
const APP_ENTRY = './index.html';
self.addEventListener('install', event => event.waitUntil((async()=>{const c=await caches.open(CACHE_NAME);try{await c.add(APP_ENTRY)}catch(e){}await self.skipWaiting()})()));
self.addEventListener('activate', event => event.waitUntil((async()=>{const names=await caches.keys();await Promise.all(names.filter(n=>n.startsWith(CACHE_PREFIX)&&n!==CACHE_NAME).map(n=>caches.delete(n)));await self.clients.claim()})()));
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{const r=event.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==self.location.origin)return;event.respondWith((async()=>{const c=await caches.open(CACHE_NAME);if(r.mode==='navigate'){try{const fresh=await fetch(r,{cache:'no-store'});if(fresh?.ok){await c.put(r,fresh.clone());await c.put(APP_ENTRY,fresh.clone())}return fresh}catch(e){return(await c.match(r))||(await c.match(APP_ENTRY))||Response.error()}}try{const fresh=await fetch(r);if(fresh?.ok)await c.put(r,fresh.clone());return fresh}catch(e){return(await c.match(r))||Response.error()}})())});
