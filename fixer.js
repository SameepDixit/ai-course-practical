(function(){
'use strict';
var D=[
{n:'Email to my manager',
 w:'write email to my manager about leave',
 s:'Write a short email to my manager asking for leave.\nFacts: I need 3 days off, Monday 9 Nov to Wednesday 11 Nov, for a family function. My handover is ready: Priya will cover my tasks.\nTone: polite and direct. Length: under 70 words.\nGive me a subject line and the email. Sign off as Karan.',
 note:'No dates, reason, tone or length. You get a generic email you must fix.',
 c:['Facts: exact dates and reason','Cover plan, so the manager has fewer questions','Tone and a word limit','Asks for a subject line too']},
{n:'Learn a topic',
 w:'explain pivot tables',
 s:'You are a patient Google Sheets trainer. I use Sheets daily but have never used a pivot table.\nExplain what a pivot table is in one sentence. Then give 5 numbered steps to total Amount by Region. Add one common mistake. Under 150 words.',
 note:'No level, no goal, no shape. You get a long textbook answer.',
 c:['Role: a patient trainer','Your level: beginner','A clear goal: total by Region','Format: 5 steps and a word limit']},
{n:'Social post',
 w:'write a post about productivity',
 s:'Write a social post under 90 words about how I cut my weekly report from 40 minutes to 8 using a chatbot. I still check every number myself.\nTone: simple and honest, like "I tried this for a month. It worked, with one catch."\nStart with a line that makes people stop. End with one question.\nDo not use hashtags, emojis or the words "game-changer".',
 note:'Vague topic. You get tired phrases and advice nobody asked for.',
 c:['A real story with numbers','A tone sample to copy','Structure: hook, detail, question','A "do not use" list']},
{n:'Summary',
 w:'summarise this',
 s:'Summarise the text below for a busy manager. Output exactly: 1) the main point in one line, 2) up to 3 actions I must take, 3) dates and numbers, 4) what is unclear.\nIf something is missing, write "Not stated". Do not guess.\n\nText: [paste your text here]',
 note:'No audience and no shape. You get a long summary that misses the actions.',
 c:['Audience: a busy manager','Four fixed parts','A rule for missing information','Placeholder: paste your text']}
];
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
