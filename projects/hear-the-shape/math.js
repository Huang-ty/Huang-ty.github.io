(function(root){
'use strict';
const BASE=Math.sqrt(1.25);
function eigenvalue(m,n=1,scale=1){return Math.PI**2*((m/(2*scale))**2+(n/scale)**2)}
function relativeFrequency(m,n=1,scale=1){return Math.sqrt((m/(2*scale))**2+(n/scale)**2)/BASE}
function shape(x,y,m,n=1,scale=1){return Math.sin(m*Math.PI*x/(2*scale))*Math.sin(n*Math.PI*y/scale)}
function displacement(x,y,m,scale,phase){return shape(x,y,m,1,scale)*Math.cos(phase)}
// Rows act on function pieces after their geometric alignment, not on scalar heights.
// Buser et al., Figure 3; numbering follows the published colored adjacency rules.
const transplant=[
 [0,1,1,0,1,0,0],
 [1,-1,0,1,0,0,0],
 [1,0,-1,0,0,0,1],
 [0,1,0,0,0,-1,-1],
 [1,0,0,0,-1,1,0],
 [0,0,0,-1,1,0,-1],
 [0,0,1,-1,0,-1,0]
];
function countModes(a,b,cutoff){
 if(![a,b,cutoff].every(Number.isFinite)||a<=0||b<=0||cutoff<0)throw new RangeError('Positive side lengths and a nonnegative finite cutoff are required.');
 const q=cutoff/Math.PI**2;let count=0;
 for(let n=1;n<=Math.floor(b*Math.sqrt(q)+1e-10);n++){
  count+=Math.max(0,Math.floor(a*Math.sqrt(Math.max(0,q-(n/b)**2))+1e-10));
 }
 return count;
}
function areaEstimate(a,b,cutoff){return cutoff>0?4*Math.PI*countModes(a,b,cutoff)/cutoff:0}
const api={eigenvalue,relativeFrequency,shape,displacement,transplant,countModes,areaEstimate};
if(typeof module==='object'&&module.exports)module.exports=api;else root.DrumMath=api;
})(typeof globalThis!=='undefined'?globalThis:this);
