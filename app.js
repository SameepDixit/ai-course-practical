(function(){
'use strict';
var KEY='pai-progress-v1',doc=document,root=doc.documentElement;
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
function load(){try{var v=JSON.parse(localStorage.getItem(KEY));return Array.isArray(v)?v:[]}catch(e){return[]}}
function save(a){try{localStorage.setItem(KEY,JSON.stringify(a))}catch(e){}}
function $(s,r){return (r||doc).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||doc).querySelectorAll(s))}
function replay(el,c){el.classList.remove(c);void el.offsetWidth;el.classList.add(c)}
/* UI strings for this page's language, written into the page by the build (src/strings/<lang>.txt) */
var TX=window.PAI_T||{};
function tr(k,o){var s=TX[k]||k;if(o)for(var x in o)s=s.split('{'+x+'}').join(o[x]);return s}

/* theme: the new paper slides down over the old one */
var tb=$('#theme');
if(tb)tb.addEventListener('click',function(){
 var cur=root.dataset.theme;
 if(!cur)cur=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
 var next=cur==='dark'?'light':'dark';
 function set(){root.dataset.theme=next;try{localStorage.setItem('pai-theme',next)}catch(e){}}
 if(!RM&&doc.startViewTransition){
  root.classList.add('vt-theme');
  var t=doc.startViewTransition(set);
  t.finished.then(function(){root.classList.remove('vt-theme')},function(){root.classList.remove('vt-theme')});
 }else set();
});

/* scroll reveal fallback: only when CSS scroll-driven animations are missing */
var SDA=window.CSS&&CSS.supports&&CSS.supports('animation-timeline','view()');
(function(){
 var els=$$('.rv');
 if(RM||SDA||!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});return}
 var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.06});
 els.forEach(function(e){io.observe(e)});
})();

/* copy buttons */
$$('.copy').forEach(function(b){
 var label=b.textContent;
 b.addEventListener('click',function(){
  var el=doc.getElementById(b.dataset.target),text=el.dataset.full||el.textContent;
  function ok(){b.textContent=tr('copied');b.classList.add('ok');setTimeout(function(){b.textContent=label;b.classList.remove('ok')},1800)}
  function fallback(){var r=doc.createRange();r.selectNodeContents(el);var s=getSelection();s.removeAllRanges();s.addRange(r);try{doc.execCommand('copy');ok()}catch(e){b.textContent=tr('hold_to_copy')}}
  if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(text).then(ok,fallback);else fallback();
 });
});

/* the press: ink the roller, then roll it down the sheet. Text is always in the DOM. */
function press(sheet,ink,done){
 if(RM){sheet.dataset.s='done';done&&done();return}
 var h=sheet.offsetHeight,dur=Math.min(2600,Math.max(900,h*3.2));
 sheet.style.setProperty('--dur',dur+'ms');
 sheet.dataset.s='ink';
 var t1=setTimeout(function(){
  sheet.dataset.s='print';
  var c=$('.cover',sheet),fin=false;
  function end(){if(fin)return;fin=true;sheet.dataset.s='done';done&&done()}
  c.addEventListener('animationend',function f(ev){if(ev.target===c){c.removeEventListener('animationend',f);end()}});
  sheet._t2=setTimeout(end,dur+400);
 },ink);
 sheet._skip=function(){clearTimeout(t1);clearTimeout(sheet._t2);sheet.dataset.s='done';done&&done()};
}
window.PAIpress=press;

function lessonPress(){
 var box=$('.outbox');if(!box||RM||!('IntersectionObserver' in window))return;
 box.dataset.s='blank';
 var io=new IntersectionObserver(function(en){if(en[0].isIntersecting){io.disconnect();press(box,650)}},{threshold:.3});
 io.observe(box);
 box.addEventListener('click',function(){if(box.dataset.s!=='done'){io.disconnect();if(box._skip)box._skip();else box.dataset.s='done'}});
}

/* home page */
var items=$$('.lessons li[data-lid]');
if(items.length){
 var LV=tr('levels').split('|'),first=true;
 var rn=$('#ringnum'),shown=0,holes=$$('.holes i');
 function countTo(n){
  if(RM){rn.textContent=n;shown=n;return}
  var from=shown,t0=performance.now();shown=n;
  requestAnimationFrame(function f(t){var p=Math.min(1,(t-t0)/700);rn.textContent=Math.round(from+(n-from)*p);if(p<1)requestAnimationFrame(f)});
 }
 function paintHome(){
  var done=load(),total=0;
  items.forEach(function(li){
   var d=done.indexOf(li.dataset.lid)>-1;if(d)total++;
   $('.status',li).textContent=d?tr('done'):tr('not_done');
  });
  var T=items.length;
  $('#donecount').textContent=tr('lessons_done',{n:total,t:T});
  var lv=total===T?5:total>=T*.75?4:total>=T*.5?3:total>=T*.25?2:total>=1?1:0;
  $('#level').textContent=tr('level',{n:lv+1,name:LV[lv]});
  $$('.count').forEach(function(c){
   var t=c.dataset.track,mine=items.filter(function(li){return li.dataset.lid.indexOf(t+'-')===0}),n=mine.filter(function(li){return done.indexOf(li.dataset.lid)>-1}).length;
   c.textContent=tr('track_count',{n:n,k:mine.length});
  });
  var next=items.filter(function(li){return done.indexOf(li.dataset.lid)<0})[0],sb=$('#startbtn');
  if(!next){sb.textContent=tr('all_done_btn');sb.href=items[0].querySelector('a').href}
  else{sb.href=next.querySelector('a').href;sb.textContent=total?tr('continue',{title:$('.tk-t',next).textContent}):tr('start')}
  function apply(){
   items.forEach(function(li){li.classList.toggle('done',done.indexOf(li.dataset.lid)>-1);li.classList.remove('now')});
   if(next)next.classList.add('now');
   holes.forEach(function(h){
    var on=done.indexOf(h.dataset.lid)>-1,was=h.classList.contains('on');
    h.classList.toggle('on',on);h.classList.toggle('just',on&&!was&&!RM);
   });
   countTo(total);
  }
  if(first&&!RM){first=false;setTimeout(apply,500)}else{first=false;apply()}
 }
 paintHome();
 $('#reset').addEventListener('click',function(){if(confirm(tr('reset_confirm'))){save([]);paintHome()}});
 addEventListener('pageshow',function(e){if(e.persisted)paintHome()});
}

/* lesson page */
var L=$('.lesson');
if(L){
 var id=L.dataset.lesson,trk=L.dataset.track,btn=$('#markdone'),msg=$('#donemsg'),lbl=$('.lbl',btn),box=$('.stampbox');
 var TNAME=L.dataset.tname,TOTAL=+L.dataset.total,K=$$('.strip li').length;
 function paint(burst){
  var a=load(),d=a.indexOf(id)>-1,n=0;
  btn.setAttribute('aria-pressed',d);
  lbl.textContent=d?tr('stamped_undo'):tr('mark_done');
  $$('.strip li').forEach(function(li){var x=a.indexOf(li.dataset.lid)>-1;li.classList.toggle('done',x);if(x)n++});
  $('#trkmsg').textContent=tr('in_track',{n:n,k:K});
  L.classList.toggle('is-done',d);box.classList.toggle('is-done',d);box.classList.toggle('track-done',d&&n===K);
  var m=d?tr('saved'):'';
  if(d&&burst){
   m=n===K?tr('track_complete',{name:TNAME}):tr('stamped');
   if(a.length===TOTAL)m=tr('all_complete',{n:TOTAL});
  }
  msg.textContent=m;
 }
 btn.addEventListener('click',function(){
  var a=load(),i=a.indexOf(id),becoming=i<0;
  if(!becoming)a.splice(i,1);else a.push(id);
  save(a);paint(true);
  box.classList.remove('slam');$$('.strip .just').forEach(function(x){x.classList.remove('just')});
  if(becoming&&!RM){
   replay(box,'slam');
   var me=$('.strip li.here');if(me)me.classList.add('just');
   if(navigator.vibrate)setTimeout(function(){try{navigator.vibrate(18)}catch(e){}},260);
  }
 });
 paint(false);
 var form=$('#quizform');
 form.addEventListener('submit',function(ev){
  ev.preventDefault();
  var qs=$$('.q',form),right=0,miss=0,pips='',k=0;
  qs.forEach(function(q){
   var sel=$('input:checked',q),fb=$('.fb',q);
   $$('.opt',q).forEach(function(o){o.classList.remove('ok','bad','ans')});
   if(!sel){miss++;fb.className='fb bad';fb.textContent=tr('choose');return}
   var ok=sel.value===q.dataset.answer,o=sel.closest('.opt');
   if(ok)right++;
   o.classList.add(ok?'ok':'bad');
   if(!ok){var c=$('input[value="'+q.dataset.answer+'"]',q);if(c)c.closest('.opt').classList.add('ans')}
   fb.className='fb '+(ok?'ok':'bad');
   fb.textContent=(ok?tr('correct'):tr('not_quite'))+' '+q.dataset.why;
   pips+='<i class="'+(ok?'on':'off')+'" style="--k:'+(k++)+'"></i>';
  });
  var s=$('#score');
  if(miss){s.textContent=tr('answer_all',{n:qs.length});return}
  s.innerHTML='<span class="pips" aria-hidden="true">'+pips+'</span><span></span>';
  s.lastChild.textContent=tr('score',{r:right,n:qs.length})+' '+(right===qs.length?tr('full_marks'):tr('try_again'));
 });
 /* reading progress fallback when CSS scroll timelines are missing */
 var sp=$('.sp');
 if(sp&&(RM||!(window.CSS&&CSS.supports&&CSS.supports('animation-timeline','scroll()')))){var tk=false;function upd(){tk=false;var h=root.scrollHeight-innerHeight;sp.style.setProperty('--sp',h>0?Math.min(1,scrollY/h):0)}
  addEventListener('scroll',function(){if(!tk){tk=true;requestAnimationFrame(upd)}},{passive:true});upd()}
 lessonPress();
}

if('serviceWorker' in navigator&&window.isSecureContext){
 addEventListener('load',function(){
  navigator.serviceWorker.register(doc.body.dataset.root+'sw.js').catch(function(){});
  /* keep this language's pages for offline use; paths in pages.json are relative to the site root */
  var pj=doc.body.dataset.pages;
  if(pj)navigator.serviceWorker.ready.then(function(reg){
   return fetch(pj).then(function(r){return r.json()}).then(function(list){if(reg.active)reg.active.postMessage({cache:list})});
  }).catch(function(){});
 });
}
})();
