/* Prompt library: filter cards by audience chip and by words typed. ?for=t5 preselects a chip. */
(function(){
'use strict';
var q=document.getElementById('pq');if(!q)return;
var $$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s))};
var cards=$$('.pcard'),chips=$$('.pchip'),cnt=document.getElementById('pcount'),none=document.getElementById('pnone');
var TX=window.PAI_T||{},aud='all';
cards.forEach(function(c){c._t=c.textContent.toLowerCase()});
function run(){
 var w=q.value.toLowerCase().split(/\s+/).filter(Boolean),n=0;
 cards.forEach(function(c){
  var ok=(aud==='all'||c.dataset.aud===aud||c.dataset.aud==='all')&&w.every(function(x){return c._t.indexOf(x)>-1});
  c.hidden=!ok;if(ok)n++;
 });
 cnt.textContent=(TX.shown||'{n}').split('{n}').join(n);
 none.hidden=n>0;
}
function pick(a){
 aud=a;
 chips.forEach(function(b){
  var on=b.dataset.aud===a;b.setAttribute('aria-pressed',on);
  if(on){var row=b.parentNode;row.scrollLeft=Math.max(0,b.offsetLeft-row.offsetLeft-16)}
 });
 run();
}
chips.forEach(function(b){b.addEventListener('click',function(){pick(b.dataset.aud)})});
q.addEventListener('input',run);
var m=/[?&]for=(t\d+)/.exec(location.search);
pick(m&&chips.some(function(b){return b.dataset.aud===m[1]})?m[1]:'all');
})();
