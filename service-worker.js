/* WORDDAY 2.7: atomic offline app shell. */
const CACHE_NAME='wordday-v3.7.3-1';
const ASSETS=['./ui37.css','./lang37.js','./content37.js','./card35.js','./result35.js','./gift35.js','./update35.css','./index.html','./vocabulary-index.json','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./favicon.ico','./favicon.png','./wildwords.js','./wildwords331fix.js','./wildwords.css','./wordday26.css','./wordday26.js','./lexicon.js','./wordday27.js','./wordday27.css','./wordday271.js','./wordday271.css','./wordday28.css','./battle-engine.js','./wordday28.js','./review28.js','./card-feedback28.js','./arena281.css','./figures281.js','./polish282.css','./battle-rules283.js','./refine283.css','./refine284.css','./victory285.js','./victory285.css','./advanced285fix.css','./wordday29.css','./luminous297.css','./expressions.css','./expression-data.js','./expression-extra.js','./expressions.js','./expression-studio-data.js','./expression-studio.js','./expression-studio.css','./refine321.css','./legend33.css','./patch331.css','./patch331fix.css','./reveal331.js','./album331.js','./friends34.js','./legend33.js','./online34.js','./battle-input34.js','./dom34.js','./realtime34.js','./battle-ui34.js','./arena34.js','./profile34.js','./design34.css','./online33.css','./好友系统配置指南.html','./传奇卡面预览.html'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE_NAME);
 // Never activate an incomplete release; the previous worker keeps working.
 await cache.addAll(ASSETS.map(path=>new Request(path,{cache:'reload'})));
 try{const config=await fetch(new Request('./online-config.js',{cache:'no-store'}));if(config.ok)await cache.put('./online-config.js',config);}catch{}
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
  if(new URL(request.url).pathname.endsWith('/online-config.js')){try{const response=await fetch(new Request(request,{cache:'no-store'}));if(response.ok){await cache.put(request,response.clone());return response;}}catch{}return (await cache.match(request))||Response.error();}
  const url=new URL(request.url),appRoot=new URL('./',self.location.href),appIndex=new URL('./index.html',self.location.href);
  const entry=request.mode==='navigate'&&(url.pathname===appRoot.pathname||url.pathname===appIndex.pathname);
  const cached=await cache.match(entry?'./index.html':request,{ignoreSearch:true});
  if(cached)return cached;
  return fetch(request);
 })());
});
