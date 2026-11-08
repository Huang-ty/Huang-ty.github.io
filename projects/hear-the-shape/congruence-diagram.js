(function(root){
'use strict';
const M=typeof module==='object'&&module.exports?require('./congruence-math.js'):root.DrumCongruence;
const project=p=>[480+105*p[0],360-105*p[1]];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const points=ps=>ps.map(p=>project(p).map(x=>x.toFixed(4)).join(',')).join(' ');
const path=ps=>'M'+ps.map(p=>project(p).map(x=>x.toFixed(4)).join(',')).join('L')+'Z';
function scene(pose={},options={}){
 const zh=options.lang!=='en',a=M.outlineA.map(p=>M.transform(p,pose)),tiles=M.transformed(M.A,pose);
 const aligned=!pose.flipped&&Math.abs(pose.angle||0)<1e-7&&Math.abs(pose.x||0)<1e-7&&Math.abs(pose.y||0)<1e-7;
 let out=`<title id="overlay-title">${zh?'鼓膜 A 和 B 的刚性叠放比较':'Rigid overlay of drumheads A and B'}</title><desc id="overlay-description">${zh?'青绿色实线是 A，橙色虚线是 B。深色表示重合区域，斜线表示各自多出的区域。大小相同，允许移动、旋转与翻转。':'A has a teal solid outline; B has an orange dashed outline. Dark shading marks their overlap; hatching marks regions belonging to only one shape. Both stay at their original size.'}</desc>
 <defs><pattern id="comparison-grid" width="42" height="42" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#c7cfc4"/></pattern>
 <pattern id="hatch-a" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M-2,2L2,-2M0,10L10,0M8,12L12,8" stroke="#167b79" stroke-width="1.2" opacity=".48"/></pattern>
 <pattern id="hatch-b" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M-2,8L2,12M0,0L10,10M8,-2L12,2" stroke="#a65f40" stroke-width="1.2" opacity=".48"/></pattern>
 <clipPath id="inside-b"><path d="${path(M.outlineB)}"/></clipPath>
 <mask id="outside-b"><rect width="960" height="720" fill="white"/><path d="${path(M.outlineB)}" fill="black"/></mask>
 <mask id="outside-a"><rect width="960" height="720" fill="white"/><path d="${path(a)}" fill="black"/></mask></defs>
 <rect width="960" height="720" fill="url(#comparison-grid)" pointer-events="none"/>
 <path d="${path(M.outlineB)}" fill="#b46c48" fill-opacity=".18" pointer-events="none"/>
 <path d="${path(a)}" fill="#167b79" fill-opacity=".2" data-drag-a="true"/>
 <path d="${path(a)}" fill="#526b5c" fill-opacity=".52" clip-path="url(#inside-b)" pointer-events="none"/>`;
 if(options.differences!==false)out+=`<path d="${path(a)}" fill="url(#hatch-a)" mask="url(#outside-b)" pointer-events="none"/><path d="${path(M.outlineB)}" fill="url(#hatch-b)" mask="url(#outside-a)" pointer-events="none"/>`;
 if(options.tiles){
  for(const [side,ts,color] of [['B',M.B,'#a65f40'],['A',tiles,'#167b79']])for(let i=0;i<7;i++){
   const tri=ts[i],c=project([tri.reduce((s,p)=>s+p[0],0)/3,tri.reduce((s,p)=>s+p[1],0)/3]);
   out+=`<polygon points="${points(tri)}" fill="none" stroke="${color}" stroke-opacity=".45" stroke-width="1" pointer-events="none"/><text class="compare-tile-label" x="${c[0]}" y="${c[1]+(side==='A'?-11:21)}" font-family="Arial,sans-serif" font-size="19" text-anchor="middle" fill="${color}" pointer-events="none">${side}${i}</text>`;
  }
 }
 if(options.landmarks){
  out+=`<polygon points="${points(M.landmarks)}" fill="#d4ac57" fill-opacity=".18" stroke="#99752d" stroke-width="2" pointer-events="none"/>`;
  if(!aligned)out+=`<polygon points="${points(M.landmarks.map(p=>M.transform(p,pose)))}" fill="none" stroke="#167b79" stroke-width="2" stroke-dasharray="5 5" pointer-events="none"/>`;
 }
 out+=`<path d="${path(M.outlineB)}" fill="none" stroke="#a65f40" stroke-width="3" stroke-dasharray="9 6" stroke-linejoin="round" vector-effect="non-scaling-stroke" pointer-events="none"/>
 <path d="${path(a)}" fill="none" stroke="#167b79" stroke-width="3" stroke-linejoin="round" vector-effect="non-scaling-stroke" data-drag-a="true"/>`;
 if(options.landmarks){
  for(let i=0;i<3;i++)for(const side of aligned?['both']:['B','A']){
   const p=project(side==='A'?M.transform(M.landmarks[i],pose):M.landmarks[i]);
   const color=side==='A'?'#167b79':side==='B'?'#a65f40':'#73561d';
   out+=`<circle cx="${p[0]}" cy="${p[1]}" r="7" fill="#fcfaf5" stroke="${color}" stroke-width="2.5" pointer-events="none"/><text class="compare-corner-label" x="${p[0]+(i===0?-15:15)}" y="${p[1]+(i===2?-18:26)}" text-anchor="${i===0?'end':'start'}" font-family="Arial,sans-serif" font-size="23" fill="${color}" font-weight="700" pointer-events="none">${['P','Q','R'][i]}${side==='both'?'':'_'+side}</text>`;
  }
 }
 if(options.witness&&aligned){
  const s=project(M.witness);
  out+=`<circle cx="${s[0]}" cy="${s[1]}" r="7" fill="#203d3b" stroke="#fcfaf5" stroke-width="2" pointer-events="none"/><path d="M${s[0]-5},${s[1]-7}l-25,-30h-16" fill="none" stroke="#203d3b" stroke-width="1.5" pointer-events="none"/><text class="compare-witness-label" x="${s[0]-50}" y="${s[1]-42}" text-anchor="end" font-family="Arial,'PingFang SC',sans-serif" font-size="21" fill="#203d3b" pointer-events="none">${esc(zh?'A 的这个角在 B 之外':'This corner of A lies outside B')}</text>`;
 }
 return out;
}
const api={scene,project};if(typeof module==='object'&&module.exports)module.exports=api;else root.DrumCongruenceDiagram=api;
})(typeof globalThis!=='undefined'?globalThis:this);
