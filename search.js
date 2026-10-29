/* Search: loads this language's search.json (same site, cached for offline) and ranks rows by
   how many typed words they contain, title hits first. ?q= fills the box. */
(function(){
'use strict';
var q=document.getElementById('sq');if(!q)return;
var list=document.getElementById('sres'),cnt=document.getElementById('scount'),TX=window.PAI_T||{},rows=[];
function tr(k,o){var s=TX[k]||k;if(o)for(var x in o)s=s.split('{'+x+'}').join(o[x]);return s}
function low(s){return s.toLowerCase()}
function run(){
 var w=low(q.value).split(/\s+/).filter(function(x){return x.length>1});
 list.textContent='';
 if(!w.length){cnt.textContent='';return}
 var hits=[];
 rows.forEach(function(r){
  var t=r._t,b=r._b,sc=0;
  for(var i=0;i<w.length;i++){var it=t.indexOf(w[i])>-1,ib=b.indexOf(w[i])>-1;if(!it&&!ib)return;sc+=it?3:1}
  hits.push([sc,r]);
 });
 hits.sort(function(a,b){return b[0]-a[0]});
 cnt.textContent=hits.length?tr('results',{n:hits.length}):tr('no_results');
 hits.slice(0,40).forEach(function(h){
  var r=h[1],li=document.createElement('li'),a=document.createElement('a'),k=document.createElement('span'),s=document.createElement('span');
  a.href=r[2];k.className='sk';k.textContent=tr('kind_'+r[0]);s.className='st';s.textContent=r[1];
  a.appendChild(k);a.appendChild(s);li.appendChild(a);list.appendChild(li);
 });
}
fetch(q.dataset.index).then(function(r){return r.json()}).then(function(d){
 rows=d.map(function(r){r._t=low(r[1]);r._b=low(r[3]);return r});
 var m=/[?&]q=([^&]*)/.exec(location.search);if(m)q.value=decodeURIComponent(m[1].replace(/\+/g,' '));
 run();
}).catch(function(){cnt.textContent=tr('search_failed')});
q.addEventListener('input',run);
})();
