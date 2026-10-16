(function(){
'use strict';
const $=id=>document.getElementById(id),M=window.DrumMath;
const canvas=$('membrane'),hero=$('hero-canvas');
let mode=1,scale=1,phase=0,playing=false,last=null,raf=null;
const messages={1:'One region moves together.<br>No interior nodal lines.',2:'Two regions move in opposite directions.<br>One stationary nodal line.',3:'Three regions alternate directions.<br>Two stationary nodal lines.'};
function prepare(c){const r=c.getBoundingClientRect(),d=Math.min(window.devicePixelRatio||1,2);if(!r.width||!r.height)return null;const w=Math.round(r.width*d),h=Math.round(r.height*d);if(c.width!==w||c.height!==h){c.width=w;c.height=h}const ctx=c.getContext('2d');if(!ctx)return null;ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,r.width,r.height);return {ctx,w:r.width,h:r.height}}
function draw(c,m,s,p,isHero=false){const result=prepare(c);if(!result)return;const {ctx,w,h}=result;const a=2*s,b=s;
 // Identical spatial scale for both sizes. The original occupies half the linear extent.
 const unit=isHero?Math.min(w/3.8,h/2.4):Math.min(w/6.5,h/3.1);
 const amp=isHero?.47:.42;const centerY=h*.48;
 const project=(x,y,z)=>[w*.5+(x-a/2)*unit*.96+(y-b/2)*unit*.55,centerY+(y-b/2)*unit*.54-(x-a/2)*unit*.14-z*unit*amp];
 const value=(x,y)=>M.displacement(x,y,m,s,p);
 function poly(points,fill,stroke,width=1){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke()}}
 // A quiet reference plane makes the fixed frame visible throughout each cycle.
 const frame=[[0,0],[a,0],[a,b],[0,b]].map(([x,y])=>project(x,y,0));
 ctx.save();ctx.shadowColor='#24483718';ctx.shadowBlur=22;ctx.shadowOffsetY=15;poly(frame,'#b7c7af28',null);ctx.restore();
 const nx=42,ny=22;
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
  const x=i*a/nx,y=j*b/ny,dx=a/nx,dy=b/ny;
  const v=value(x+dx/2,y+dy/2),power=Math.min(1,Math.abs(v));
  const rgb=v>=0?[93,153,133]:[192,130,91];
  const pale=[229,235,215];const mix=.35+.65*power;
  const color=`rgb(${rgb.map((q,k)=>Math.round(pale[k]*(1-mix)+q*mix)).join(',')})`;
  poly([[x,y],[x+dx,y],[x+dx,y+dy],[x,y+dy]].map(([u,v])=>project(u,v,value(u,v))),color,color,.55);
 }
 // A sparse mesh follows the displacement, rather than a decorative travelling wave.
 ctx.strokeStyle='#234f4548';ctx.lineWidth=.55;
 for(let i=0;i<=18;i++){ctx.beginPath();for(let j=0;j<=36;j++){const x=i*a/18,y=j*b/36,pt=project(x,y,value(x,y));j?ctx.lineTo(...pt):ctx.moveTo(...pt)}ctx.stroke()}
 for(let j=0;j<=12;j++){ctx.beginPath();for(let i=0;i<=64;i++){const x=i*a/64,y=j*b/12,pt=project(x,y,value(x,y));i?ctx.lineTo(...pt):ctx.moveTo(...pt)}ctx.stroke()}
 ctx.save();ctx.setLineDash([5,4]);ctx.strokeStyle='#173f31';ctx.lineWidth=1.7;
 for(let k=1;k<m;k++){ctx.beginPath();ctx.moveTo(...project(k*a/m,0,0));ctx.lineTo(...project(k*a/m,b,0));ctx.stroke()}ctx.restore();
 poly(frame,null,'#294f41',isHero?1.6:2);
 frame.forEach(pt=>{ctx.beginPath();ctx.arc(...pt,3,0,2*Math.PI);ctx.fillStyle='#294f41';ctx.fill()});
 if(!isHero){
  ctx.textAlign='center';
  // Signs also encode displacement; the information does not depend on color alone.
  if(Math.abs(Math.cos(p))>.15){ctx.font='bold 16px Arial';for(let k=0;k<m;k++){const x=(k+.5)*a/m,y=b/2,z=value(x,y);const pt=project(x,y,z);ctx.fillStyle='#163e32';ctx.fillText(z>=0?'+':'−',pt[0],pt[1]+5)}}
 }
}
function render(){draw(canvas,mode,scale,phase);}
function update(announce=false){const f=M.relativeFrequency(mode,1,scale).toFixed(3);$('frequency').textContent=f;$('dimension-label').textContent=`${2*scale} × ${scale} units`;$('mode-description').innerHTML=messages[mode];const txt=`Mode ${mode}: ${mode===1?'no':mode-1} interior nodal ${mode===2?'line':'lines'}. Relative frequency ${f}, dimensions ${2*scale} by ${scale} units.`;$('canvas-description').textContent=txt+' The view is one standing mode; all outer edges are fixed.';if(announce)$('selection-status').textContent=txt;document.querySelectorAll('.mode').forEach(b=>{const active=Number(b.dataset.mode)===mode;b.classList.toggle('active',active);b.setAttribute('aria-pressed',active)});document.querySelectorAll('.size-button').forEach(b=>{const active=Number(b.dataset.scale)===scale;b.classList.toggle('active',active);b.setAttribute('aria-pressed',active)});render()}
function setPlaying(value){playing=value;$('play-label').textContent=playing?'Pause animation':'Play animation';$('play-icon').textContent=playing?'Ⅱ':'▶';$('play').setAttribute('aria-label',playing?'Pause membrane animation':'Play membrane animation');$('motion-state').textContent=playing?'PLAYING':'PAUSED';$('motion-dot').classList.toggle('playing',playing);last=null;if(raf)cancelAnimationFrame(raf);raf=null;if(playing)raf=requestAnimationFrame(tick)}
function tick(t){if(!playing)return;if(last!==null){const dt=Math.min((t-last)/1000,.1);phase=(phase+dt*2*Math.PI*.42*M.relativeFrequency(mode,1,scale))%(2*Math.PI)}last=t;render();raf=requestAnimationFrame(tick)}
$('play').addEventListener('click',()=>setPlaying(!playing));
document.querySelectorAll('.mode').forEach(b=>b.addEventListener('click',()=>{mode=Number(b.dataset.mode);phase=0;last=null;update(true)}));
$('reset').addEventListener('click',()=>{setPlaying(false);mode=1;scale=1;phase=0;$('prediction-feedback').hidden=true;$('size-comparison').hidden=true;document.querySelectorAll('.answer').forEach(b=>{b.classList.remove('chosen','wrong','correct');b.setAttribute('aria-pressed','false')});update(true)});
document.querySelectorAll('.answer').forEach(b=>b.addEventListener('click',()=>{const right=b.dataset.answer==='half';document.querySelectorAll('.answer').forEach(x=>{x.classList.toggle('chosen',x===b);x.classList.toggle('wrong',x===b&&!right);x.classList.toggle('correct',x.dataset.answer==='half');x.setAttribute('aria-pressed',String(x===b))});$('prediction-feedback').innerHTML=`<strong>${right?'Exactly — every frequency halves.':'The answer is: every frequency halves.'}</strong>Both lengths double, so each eigenvalue becomes one quarter as large. Frequency is proportional to its square root. The doubled drum is 4 × 2 units. Compare both sizes below.`;$('prediction-feedback').hidden=false;$('size-comparison').hidden=false;scale=2;phase=0;last=null;update(true)}));
document.querySelectorAll('.size-button').forEach(b=>b.addEventListener('click',()=>{scale=Number(b.dataset.scale);phase=0;last=null;update(true)}));
$('pieces-toggle').addEventListener('click',()=>{const visible=$('pair-diagram').classList.toggle('show-pieces');$('pieces-toggle').setAttribute('aria-pressed',visible);$('pieces-toggle').innerHTML=`${visible?'Hide':'Show'} triangle construction <span aria-hidden="true">${visible?'−':'+'}</span>`});
new ResizeObserver(()=>{render();draw(hero,2,1,0,true)}).observe(document.body);
document.addEventListener('visibilitychange',()=>{if(document.hidden)setPlaying(false)});
window.addEventListener('beforeprint',()=>setPlaying(false));
update();draw(hero,2,1,0,true);
})();
