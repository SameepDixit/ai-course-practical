/* Lantern home: offline cache only (the press pages get this from app.js). */
(function(){
if(!('serviceWorker' in navigator&&window.isSecureContext))return;
addEventListener('load',function(){
 var b=document.body;
 navigator.serviceWorker.register(b.dataset.root+'sw.js').catch(function(){});
 var pj=b.dataset.pages;
 if(pj)navigator.serviceWorker.ready.then(function(reg){
  return fetch(pj).then(function(r){return r.json()}).then(function(list){if(reg.active)reg.active.postMessage({cache:list})});
 }).catch(function(){});
});
})();
