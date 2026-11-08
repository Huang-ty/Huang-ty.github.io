(function(){
'use strict';
const M=window.DrumCongruence,D=window.DrumCongruenceDiagram;
if(!M||!D)return;
const $=id=>document.getElementById(id),svg=$('comparison-svg');
const translated=[...document.querySelectorAll('[data-en]')];
translated.forEach(el=>{el.dataset.zh=el.textContent});
let lang=new URLSearchParams(location.search).get('lang')==='en'?'en':'zh';
let pose={angle:0,x:0,y:0,flipped:false},witness=false,drag=null;
const limits={x:1.8,y:.9},total=M.A.reduce((s,t)=>s+M.area(t),0);
const options=()=>({lang,tiles:$('show-tiles').checked,landmarks:$('show-landmarks').checked,differences:$('show-differences').checked,witness});
const aligned=()=>!pose.flipped&&Math.abs(pose.angle)<1e-8&&Math.abs(pose.x)<1e-8&&Math.abs(pose.y)<1e-8;
const clamp=(value,limit)=>Math.max(-limit,Math.min(limit,value));
function render(announce=false){
 svg.innerHTML=D.scene(pose,options());
 const percentage=100*M.overlap(M.transformed(M.A,pose),M.B)/total;
 $('overlap-value').innerHTML=percentage.toFixed(1)+'<small>%</small>';
 for(const [id,key] of [['rotation','angle'],['move-x','x'],['move-y','y']])$(id).value=pose[key];
 $('rotation-value').textContent=Math.round(pose.angle)+'°';
 $('move-x-value').textContent=pose.x.toFixed(2);$('move-y-value').textContent=pose.y.toFixed(2);
 $('flip-shape').setAttribute('aria-pressed',String(pose.flipped));
 if(announce){
  $('comparison-status').textContent=lang==='zh'
   ?`重合 ${percentage.toFixed(1)}%。${aligned()?'三个凹角已对齐；外轮廓仍然不同。':'当前摆法仍有未重合区域。'}`
   :`${percentage.toFixed(1)}% overlaps. ${aligned()?'All three inward corners align; the outer outlines still differ.':'Some regions do not coincide in this placement.'}`;
 }
}
function applyLanguage(){
 document.documentElement.lang=lang==='zh'?'zh-Hans':'en';
 translated.forEach(el=>{el.textContent=el.dataset[lang]});
 $('language-toggle').textContent=lang==='zh'?'English':'中文';
 $('language-toggle').lang=lang==='zh'?'en':'zh-Hans';
 $('language-toggle').setAttribute('aria-label',lang==='zh'?'Switch to English':'切换为中文');
 document.title=lang==='zh'?'A 与 B 为什么不能完全重合？— Form & Frequency':'Why A and B Cannot Coincide — Form & Frequency';
 $('comparison-fallback').alt=lang==='zh'?'中心三角形对齐后，外围仍有未重合区域。':'The central triangles align, but the outer arms still do not coincide.';
 render(true);
}
$('language-toggle').addEventListener('click',()=>{
 lang=lang==='zh'?'en':'zh';const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url);applyLanguage();
});
for(const [id,key] of [['rotation','angle'],['move-x','x'],['move-y','y']]){
 $(id).addEventListener('input',event=>{pose[key]=Number(event.target.value);witness=false;render()});
 $(id).addEventListener('change',()=>render(true));
}
for(const id of ['show-differences','show-landmarks','show-tiles'])$(id).addEventListener('change',()=>render(true));
$('flip-shape').addEventListener('click',()=>{pose.flipped=!pose.flipped;witness=false;render(true)});
function align(showWitness=false){pose={angle:0,x:0,y:0,flipped:false};$('show-landmarks').checked=true;witness=showWitness;render(true)}
$('align-shape').addEventListener('click',()=>align(false));
$('reset-comparison').addEventListener('click',()=>{
 pose={angle:0,x:0,y:0,flipped:false};witness=false;
 $('show-landmarks').checked=false;$('show-tiles').checked=false;$('show-differences').checked=true;render(true);
});
for(const button of document.querySelectorAll('[data-proof]'))button.addEventListener('click',()=>{
 if(button.dataset.proof==='corners'){$('show-landmarks').checked=true;render(true)}
 else{if(button.dataset.proof==='difference')$('show-differences').checked=true;align(button.dataset.proof==='difference')}
 $('comparison').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
 svg.focus({preventScroll:true});
});
function localPoint(event){const point=new DOMPoint(event.clientX,event.clientY);return point.matrixTransform(svg.getScreenCTM().inverse())}
svg.addEventListener('pointerdown',event=>{
 if(event.button!==0||!event.target.closest('[data-drag-a]'))return;
 const p=localPoint(event);drag={id:event.pointerId,point:p,x:pose.x,y:pose.y};witness=false;
 svg.setPointerCapture(event.pointerId);svg.classList.add('is-dragging');svg.focus({preventScroll:true});event.preventDefault();
});
svg.addEventListener('pointermove',event=>{
 if(!drag||event.pointerId!==drag.id)return;
 const p=localPoint(event);pose.x=clamp(drag.x+(p.x-drag.point.x)/105,limits.x);pose.y=clamp(drag.y-(p.y-drag.point.y)/105,limits.y);render();
});
function stopDrag(event){
 if(!drag||event.pointerId!==drag.id)return;
 if(svg.hasPointerCapture(event.pointerId))svg.releasePointerCapture(event.pointerId);
 drag=null;svg.classList.remove('is-dragging');render(true);
}
svg.addEventListener('pointerup',stopDrag);svg.addEventListener('pointercancel',stopDrag);
svg.addEventListener('keydown',event=>{
 const step=event.shiftKey ? .2 : .05;
 switch(event.key){
  case 'ArrowLeft':pose.x=clamp(pose.x-step,limits.x);break;
  case 'ArrowRight':pose.x=clamp(pose.x+step,limits.x);break;
  case 'ArrowUp':pose.y=clamp(pose.y+step,limits.y);break;
  case 'ArrowDown':pose.y=clamp(pose.y-step,limits.y);break;
  case 'r':case 'R':pose.angle=pose.angle>=165?pose.angle-345:pose.angle+15;break;
  case 'f':case 'F':pose.flipped=!pose.flipped;break;
  case 'Home':align(false);event.preventDefault();return;
  default:return;
 }
 witness=false;event.preventDefault();render(true);
});
$('comparison-controls').disabled=false;svg.removeAttribute('hidden');$('comparison-fallback').hidden=true;applyLanguage();
})();
