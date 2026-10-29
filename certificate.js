/* Certificate: drawn on a canvas from the progress saved on this phone, so it can be saved as a
   picture or printed. Self-issued: nothing is sent anywhere and nobody verifies it. */
(function(){
'use strict';
var cv=document.getElementById('cert'),D=window.PAI_CERT;if(!cv||!D)return;
var TX=window.PAI_T||{},doc=document;
function tr(k,o){var s=TX[k]||k;if(o)for(var x in o)s=s.split('{'+x+'}').join(o[x]);return s}
function done(){try{var v=JSON.parse(localStorage.getItem('pai-progress-v1'));return Array.isArray(v)?v:[]}catch(e){return[]}}
/* print colours: always the light "paper" palette, whatever theme the page is in (see :root in style.css) */
var INK='#1d1a16',PAPER='#fbf6ec',SOFT='#564d42',COL={all:'#b42a12',t1:'#b42a12',t2:'#0a6553',t3:'#8a5200',t4:'#b3185a',t5:'#24489a',t6:'#6b2f7a',t7:'#4d5a10'};
var nameIn=doc.getElementById('cname'),pick=doc.getElementById('cwhich'),msg=doc.getElementById('cmsg'),save=doc.getElementById('csave'),prn=doc.getElementById('cprint');

/* options: whole course, then each track; locked until every lesson in it is done */
function fillPick(){
 var a=done(),keep=pick.value;pick.textContent='';
 function add(val,label,ids){
  var d=ids.filter(function(i){return a.indexOf(i)>-1}).length,o=doc.createElement('option');
  o.value=val;o.disabled=d<ids.length;o.textContent=label+(d<ids.length?' · '+tr('cert_progress',{d:d,k:ids.length}):'');
  pick.appendChild(o);
 }
 add('all',tr('cert_whole',{n:D.all.length}),D.all);
 D.tracks.forEach(function(t){add(t.id,tr('cert_track',{n:t.n,name:t.name}),t.ids)});
 var first=Array.prototype.filter.call(pick.options,function(o){return !o.disabled})[0];
 if(keep&&pick.querySelector('option[value="'+keep+'"]:not([disabled])'))pick.value=keep;else if(first)pick.value=first.value;
 return !!first;
}

function fit(ctx,text,font,size,max){var s=size;do{ctx.font=font.replace('{s}',s);s-=4}while(ctx.measureText(text).width>max&&s>24);return s+4}

function draw(){
 var ok=fillPick(),name=nameIn.value.trim(),c=cv.getContext('2d'),W=cv.width,H=cv.height;
 var sel=ok?pick.value:'all',t=D.tracks.filter(function(x){return x.id===sel})[0],acc=COL[sel]||COL.all;
 c.fillStyle=PAPER;c.fillRect(0,0,W,H);
 c.strokeStyle=INK;c.lineWidth=14;c.strokeRect(30,30,W-60,H-60);c.lineWidth=3;c.strokeRect(58,58,W-116,H-116);
 c.fillStyle=acc;c.fillRect(58,58,W-116,70);
 c.fillStyle=PAPER;c.font='400 26px "Courier Prime",monospace';c.textBaseline='middle';
 c.textAlign='left';c.fillText(tr('cert_band_l').toUpperCase(),90,93);
 c.textAlign='right';c.fillText(tr('cert_band_r').toUpperCase(),W-90,93);
 c.textAlign='center';c.textBaseline='alphabetic';c.fillStyle=INK;
 var h=tr('cert_heading').toUpperCase();fit(c,h,'800 {s}px "Big Shoulders",Impact,sans-serif',128,W-260);c.fillText(h,W/2,290);
 c.font='400 40px "Zilla Slab",Georgia,serif';c.fillStyle=SOFT;c.fillText(tr('cert_records'),W/2,380);
 var nm=(name||tr('cert_your_name')).toUpperCase();
 fit(c,nm,'900 {s}px "Big Shoulders",Impact,sans-serif',140,W-300);c.fillStyle=name?acc:'#b9ad99';c.fillText(nm,W/2,530);
 c.fillStyle=INK;c.fillRect(W/2-420,560,840,4);
 var line=t?tr('cert_did_track',{track:tr('cert_track',{n:t.n,name:t.name}),n:t.ids.length}):tr('cert_did_all',{n:D.all.length});
 c.font='700 40px "Zilla Slab",Georgia,serif';wrap(c,line,W/2,640,W-420,52);
 var when=new Date().toLocaleDateString(D.lang+'-IN',{day:'numeric',month:'long',year:'numeric'});
 c.font='400 30px "Courier Prime",monospace';c.fillStyle=SOFT;c.fillText(tr('cert_date',{date:when}),W/2,800);
 stamp(c,W-260,H-250,120,acc);
 c.font='400 22px "Courier Prime",monospace';c.fillStyle=SOFT;c.textAlign='left';
 wrap(c,tr('cert_fine'),110,H-150,W-560,30,'left');
 save.disabled=prn.disabled=!(ok&&name);
 msg.textContent=!ok?tr('cert_locked'):!name?tr('cert_need_name'):'';
}
function wrap(c,text,x,y,max,lh,align){
 var words=text.split(' '),line='',lines=[];
 words.forEach(function(w){var tst=line?line+' '+w:w;if(c.measureText(tst).width>max&&line){lines.push(line);line=w}else line=tst});
 lines.push(line);c.textAlign=align||'center';
 lines.forEach(function(l,i){c.fillText(l,x,y+i*lh)});
}
function stamp(c,x,y,r,col){
 c.save();c.translate(x,y);c.rotate(-.21);c.strokeStyle=col;c.fillStyle=col;c.globalAlpha=.9;
 c.lineWidth=9;c.beginPath();c.arc(0,0,r,0,7);c.stroke();c.lineWidth=3;c.beginPath();c.arc(0,0,r-26,0,7);c.stroke();
 c.fillRect(-r+6,-30,2*r-12,60);c.fillStyle=PAPER;c.font='900 52px "Big Shoulders",Impact,sans-serif';c.textAlign='center';c.textBaseline='middle';
 c.fillText(tr('cert_stamp').toUpperCase(),0,3);
 c.fillStyle=col;c.font='400 15px "Courier Prime",monospace';
 var one=(tr('cert_ring')+'  ·  ').toUpperCase(),ring=one+one,step=(2*Math.PI)/ring.length;
 for(var i=0;i<ring.length;i++){c.save();c.rotate(i*step);c.translate(0,-r+14);c.fillText(ring[i],0,0);c.restore()}
 c.restore();
}

save.addEventListener('click',function(){
 cv.toBlob(function(b){if(!b)return;var a=doc.createElement('a');a.href=URL.createObjectURL(b);a.download='practical-ai-certificate.png';doc.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},1000)},'image/png');
});
prn.addEventListener('click',function(){var img=doc.getElementById('certimg');img.src=cv.toDataURL('image/png');setTimeout(function(){window.print()},100)});
nameIn.addEventListener('input',draw);pick.addEventListener('change',draw);
addEventListener('pageshow',draw);
var fonts=['800 40px "Big Shoulders"','900 40px "Big Shoulders"','400 20px "Zilla Slab"','700 20px "Zilla Slab"','400 20px "Courier Prime"'];
draw();
if(doc.fonts&&doc.fonts.load)Promise.all(fonts.map(function(f){return doc.fonts.load(f)})).then(draw,draw);
})();
