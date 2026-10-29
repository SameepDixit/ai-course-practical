/* Hero: a request is typed on a slip, the roller inks up, then prints the result sheet.
   Pauses off-screen and when the tab is hidden. Reduced motion: one finished print. */
(function(){
'use strict';
var st=document.getElementById('stage');if(!st)return;
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
var S=window.PAI_HERO;if(!S||!S.length)return;
var typed=st.querySelector('.typed'),lines=document.getElementById('st-lines'),sheet=document.getElementById('hsheet'),no=document.getElementById('slipno');
function fill(s){lines.textContent='';s.r.forEach(function(x){var e=document.createElement('span');e.textContent=x[0];if(x[1])e.className=x[1];lines.appendChild(e)})}
if(RM||!window.PAIpress){typed.textContent=S[0].p;fill(S[0]);st.dataset.s='done';return}
var vis=true,tabvis=true;
function wake(){return vis&&tabvis}
function sleep(ms){return new Promise(function(res){var left=ms,last=performance.now();
 (function tick(){var n=performance.now();if(wake())left-=n-last;last=n;if(left<=0)res();else setTimeout(tick,50)})()})}
function printed(){return new Promise(function(res){window.PAIpress(sheet,900,res)})}
async function loop(){
 for(var i=0;;i++){
  var s=S[i%S.length];
  no.textContent=(window.PAI_T&&PAI_T.slip_no||'No. {n}').split('{n}').join(417+i);
  st.dataset.s='type';typed.textContent='';sheet.dataset.s='blank';fill(s);
  await sleep(600);
  for(var k=1;k<=s.p.length;k++){typed.textContent=s.p.slice(0,k);await sleep(24+Math.random()*30)}
  st.dataset.s='think';
  await sleep(200);
  while(!wake())await sleep(200);
  await printed();
  st.dataset.s='done';
  await sleep(4200);
 }
}
new IntersectionObserver(function(en){vis=en[0].isIntersecting;st.classList.toggle('off',!vis)},{threshold:.1}).observe(st);
document.addEventListener('visibilitychange',function(){tabvis=!document.hidden});
loop();
})();
