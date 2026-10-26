(function(){
'use strict';
var KEY='pai-progress-v1',doc=document,root=doc.documentElement;
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
function load(){try{var v=JSON.parse(localStorage.getItem(KEY));return Array.isArray(v)?v:[]}catch(e){return[]}}
function save(a){try{localStorage.setItem(KEY,JSON.stringify(a))}catch(e){}}
function $(s,r){return (r||doc).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||doc).querySelectorAll(s))}
function replay(el,c){el.classList.remove(c);void el.offsetWidth;el.classList.add(c)}

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
  function ok(){b.textContent='Copied';b.classList.add('ok');setTimeout(function(){b.textContent=label;b.classList.remove('ok')},1800)}
  function fallback(){var r=doc.createRange();r.selectNodeContents(el);var s=getSelection();s.removeAllRanges();s.addRange(r);try{doc.execCommand('copy');ok()}catch(e){b.textContent='Press and hold to copy'}}
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
 var LV=['Newcomer','Warming up','Getting fast','Power user','Pro','AI-ready'],first=true;
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
   $('.status',li).textContent=d?'Done':'Not done';
  });
  $('#donecount').textContent=total+' of 20 lessons done';
  var lv=total===20?5:total>=15?4:total>=10?3:total>=5?2:total>=1?1:0;
  $('#level').textContent='Level '+(lv+1)+' · '+LV[lv];
  $$('.count').forEach(function(c){
   var t=c.dataset.track,n=items.filter(function(li){return li.dataset.lid.indexOf(t+'-')===0&&done.indexOf(li.dataset.lid)>-1}).length;
   c.textContent=n+' of 5 done';
  });
  var next=items.filter(function(li){return done.indexOf(li.dataset.lid)<0})[0],sb=$('#startbtn');
  if(!next){sb.textContent='All done. Review any lesson';sb.href=items[0].querySelector('a').href}
  else{sb.href=next.querySelector('a').href;sb.textContent=total?'Continue: '+$('.tk-t',next).textContent:'Start lesson 1'}
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
 $('#reset').addEventListener('click',function(){if(confirm('Reset all progress on this phone?')){save([]);paintHome()}});
 addEventListener('pageshow',function(e){if(e.persisted)paintHome()});
}

/* lesson page */
var L=$('.lesson');
if(L){
 var id=L.dataset.lesson,trk=L.dataset.track,btn=$('#markdone'),msg=$('#donemsg'),lbl=$('.lbl',btn),box=$('.stampbox');
 var TN={t1:'Get answers faster',t2:'Automate office work',t3:'Make content',t4:'Build small tools'};
 function paint(burst){
  var a=load(),d=a.indexOf(id)>-1,n=0;
  btn.setAttribute('aria-pressed',d);
  lbl.textContent=d?'Stamped. Tap to undo':'Stamp it: mark as done';
  $$('.strip li').forEach(function(li){var x=a.indexOf(li.dataset.lid)>-1;li.classList.toggle('done',x);if(x)n++});
  $('#trkmsg').textContent=n+' of 5 done in this track';
  L.classList.toggle('is-done',d);box.classList.toggle('is-done',d);box.classList.toggle('track-done',d&&n===5);
  var m=d?'Saved on this phone.':'';
  if(d&&burst){
   m=n===5?'Track complete! You finished "'+TN[trk]+'".':'Stamped. Saved on this phone.';
   if(a.length===20)m='All 20 lessons done. You are AI-ready.';
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
   if(!sel){miss++;fb.className='fb bad';fb.textContent='Please choose an answer.';return}
   var ok=sel.value===q.dataset.answer,o=sel.closest('.opt');
   if(ok)right++;
   o.classList.add(ok?'ok':'bad');
   if(!ok){var c=$('input[value="'+q.dataset.answer+'"]',q);if(c)c.closest('.opt').classList.add('ans')}
   fb.className='fb '+(ok?'ok':'bad');
   fb.textContent=(ok?'Correct. ':'Not quite. ')+q.dataset.why;
   pips+='<i class="'+(ok?'on':'off')+'" style="--k:'+(k++)+'"></i>';
  });
  var s=$('#score');
  if(miss){s.textContent='Answer all '+qs.length+' questions first.';return}
  s.innerHTML='<span class="pips" aria-hidden="true">'+pips+'</span><span></span>';
  s.lastChild.textContent='You got '+right+' of '+qs.length+'.'+(right===qs.length?' Full marks. Now stamp the ticket below.':' Read the notes above and try again.');
 });
 /* reading progress fallback when CSS scroll timelines are missing */
 var sp=$('.sp');
 if(sp&&(RM||!(window.CSS&&CSS.supports&&CSS.supports('animation-timeline','scroll()')))){var tk=false;function upd(){tk=false;var h=root.scrollHeight-innerHeight;sp.style.setProperty('--sp',h>0?Math.min(1,scrollY/h):0)}
  addEventListener('scroll',function(){if(!tk){tk=true;requestAnimationFrame(upd)}},{passive:true});upd()}
 lessonPress();
}

if('serviceWorker' in navigator&&window.isSecureContext){
 addEventListener('load',function(){navigator.serviceWorker.register(doc.body.dataset.root+'sw.js').catch(function(){})});
}
})();
