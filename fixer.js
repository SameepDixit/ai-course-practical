(function(){
'use strict';
var D=window.PAI_FIXER;if(!D||!D.length)return;
var $=function(s){return document.querySelector(s)},pick=$('#fx-pick');
if(!pick)return;
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
var weak=$('#fx-weak'),strong=$('#fx-strong'),ul=$('#fx-changes'),grid=$('#fx-grid'),paper=$('.fx-paper'),sheet=$('.fx-sheet'),seq=0;
D.forEach(function(d,i){var o=document.createElement('option');o.value=i;o.textContent=d.n;pick.appendChild(o)});
function chips(pop){
 var d=D[+pick.value];ul.textContent='';
 d.c.forEach(function(x,k){var li=document.createElement('li');li.textContent=x;if(pop){li.className='pop';li.style.setProperty('--k',k)}ul.appendChild(li)});
}
/* proofread: strike the weak prompt, stamp it "too vague", then print the strong one with the roller */
function morph(){
 var id=++seq;
 if(grid.dataset.view==='weak')setView('both');
 paper.classList.remove('struck');void paper.offsetWidth;paper.classList.add('struck');
 if(RM||!window.PAIpress){chips(false);return}
 ul.textContent='';
 sheet.dataset.s='blank';
 setTimeout(function(){if(id!==seq)return;window.PAIpress(sheet,350,function(){if(id===seq)chips(true)})},650);
}
function show(){
 var d=D[+pick.value];
 seq++;paper.classList.remove('struck');if(sheet._skip)sheet._skip();sheet.dataset.s='done';
 weak.textContent=d.w;strong.textContent=d.s;strong.dataset.full=d.s;$('#fx-weak-note').textContent=d.note;
 chips(false);
}
function setView(v){grid.dataset.view=v;btns.forEach(function(x){x.setAttribute('aria-pressed',x.dataset.view===v)})}
var btns=Array.prototype.slice.call(document.querySelectorAll('.segbtn'));
btns.forEach(function(b){b.addEventListener('click',function(){setView(b.dataset.view)})});
pick.addEventListener('change',function(){show();morph()});
$('#fx-go').addEventListener('click',function(){show();morph()});
show();
if(!RM&&'IntersectionObserver' in window){
 var io=new IntersectionObserver(function(en){if(en[0].isIntersecting){io.disconnect();morph()}},{threshold:.45});
 io.observe($('#fixer'));
}
})();
