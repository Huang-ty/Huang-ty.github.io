(function(root){
'use strict';
const BASE=Math.sqrt(1.25);
function eigenvalue(m,n=1,scale=1){return Math.PI**2*((m/(2*scale))**2+(n/scale)**2)}
function relativeFrequency(m,n=1,scale=1){return Math.sqrt((m/(2*scale))**2+(n/scale)**2)/BASE}
function shape(x,y,m,n=1,scale=1){return Math.sin(m*Math.PI*x/(2*scale))*Math.sin(n*Math.PI*y/scale)}
function displacement(x,y,m,scale,phase){return shape(x,y,m,1,scale)*Math.cos(phase)}
const api={eigenvalue,relativeFrequency,shape,displacement};
if(typeof module==='object'&&module.exports)module.exports=api;else root.DrumMath=api;
})(typeof globalThis!=='undefined'?globalThis:this);
