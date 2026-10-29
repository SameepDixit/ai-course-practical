/* PAGES = files every language shares. Each page then asks for its own language's pages (pages.json). */
var CACHE='pai-d1da211fe2',PAGES=["./", "index.html", "style.css", "app.js", "hero.js", "fixer.js", "hubs.js", "search.js", "certificate.js", "icon.svg", "manifest.webmanifest", "lantern.css", "lantern.js", "lantern-3d.js", "vendor/three/three.module.min.js", "vendor/three/three.core.min.js", "fonts/bigshoulders.woff2", "fonts/courierprime.woff2", "fonts/jakarta-400.woff2", "fonts/jakarta-500.woff2", "fonts/jakarta-600.woff2", "fonts/jakarta-700.woff2", "fonts/zilla-b.woff2", "fonts/zilla-r.woff2"];
self.addEventListener('message',function(e){var l=e.data&&e.data.cache;if(Array.isArray(l))e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(l)}).catch(function(){}))});
self.addEventListener('install',function(e){e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(PAGES)}).then(function(){return self.skipWaiting()}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==CACHE}).map(function(x){return caches.delete(x)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener('fetch',function(e){
 if(e.request.method!=='GET')return;
 e.respondWith(fetch(e.request).then(function(r){if(r.ok){var c=r.clone();caches.open(CACHE).then(function(x){x.put(e.request,c)})}return r}).catch(function(){
  return caches.match(e.request,{ignoreSearch:true}).then(function(m){return m||(e.request.mode==='navigate'?caches.match('index.html'):undefined)})}));
});
