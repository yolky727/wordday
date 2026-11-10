/* WORDDAY 2.7: atomic offline app shell. */
const CACHE_NAME='wordday-v3.1.10-1';
const ASSETS=['./index.html','./vocabulary-index.json','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./favicon.ico','./favicon.png','./wildwords.js','./wildwords.css','./wordday26.css','./wordday26.js','./lexicon.js','./wordday27.js','./wordday27.css','./wordday271.js','./wordday271.css','./wordday28.css','./battle-engine.js','./wordday28.js','./review28.js','./card-feedback28.js','./arena281.css','./figures281.js','./polish282.css','./battle-rules283.js','./refine283.css','./refine284.css','./victory285.js','./victory285.css','./advanced285fix.css','./wordday29.css','./luminous297.css','./expressions.css','./expression-data.js','./expression-extra.js','./expressions.js'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE_NAME);
 // Never activate an incomplete release; the previous worker keeps working.
 await cache.addAll(ASSETS.map(path=>new Request(path,{cache:'reload'})));
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const name of await caches.keys())if(name.startsWith('wordday-')&&name!==CACHE_NAME)await caches.delete(name);
 await self.clients.claim();
})()));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{
 const request=event.request;if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE_NAME);
  // HTML and its scripts come from the same installed release, even offline.
  const cached=await cache.match(request.mode==='navigate'?'./index.html':request,{ignoreSearch:true});
  if(cached)return cached;
  return fetch(request);
 })());
});
