/* Geometry for the Buser et al. seven-triangle propeller pair, Figures 2–3.
   Same triangle and edge-color adjacencies as the essay's existing diagrams.
   Coordinates are rebuilt by reflections, rather than measured from a picture. */
(function(root){
'use strict';
const EPS=1e-9;
const base=[[0,0],[1.4,0],[.45,1]];
const center=[base.reduce((s,p)=>s+p[0],0)/3,base.reduce((s,p)=>s+p[1],0)/3];
const adjA=[[[0,1],[2,5]],[[0,2],[4,3]],[[0,4],[1,6]]];
const adjB=[[[0,4],[2,3]],[[0,1],[4,6]],[[0,2],[1,5]]];
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
const distance=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1]);
function signedArea(ps){return ps.reduce((s,p,i)=>{const q=ps[(i+1)%ps.length];return s+p[0]*q[1]-p[1]*q[0]},0)/2}
const area=ps=>Math.abs(signedArea(ps));
function reflect(p,u,v){
 const dx=v[0]-u[0],dy=v[1]-u[1];
 const t=((p[0]-u[0])*dx+(p[1]-u[1])*dy)/(dx*dx+dy*dy);
 return [2*(u[0]+t*dx)-p[0],2*(u[1]+t*dy)-p[1]];
}
function build(adj){
 const tiles={0:base.map(p=>p.slice())},queue=[0];
 for(const i of queue)for(let color=0;color<3;color++)for(const [a,b] of adj[color]){
  const next=a===i?b:b===i?a:null;
  if(next===null||tiles[next])continue;
  const edge=[0,1,2].filter(k=>k!==color),u=tiles[i][edge[0]],v=tiles[i][edge[1]];
  tiles[next]=tiles[i].map(p=>reflect(p,u,v));queue.push(next);
 }
 return Array.from({length:7},(_,j)=>tiles[j].map(p=>[p[0]-center[0],p[1]-center[1]]));
}
const key=p=>p.map(x=>Math.round(x*1e8)).join(',');
function boundary(tiles){
 const edges=new Map(),points=new Map();
 for(const tri of tiles)for(let i=0;i<3;i++){
  const a=tri[i],b=tri[(i+1)%3],ka=key(a),kb=key(b),k=[ka,kb].sort().join('|');
  points.set(ka,a);points.set(kb,b);
  const edge=edges.get(k);if(edge)edge.count++;else edges.set(k,{a:ka,b:kb,count:1});
 }
 const links=new Map();
 for(const e of edges.values())if(e.count===1){
  for(const [a,b] of [[e.a,e.b],[e.b,e.a]]){if(!links.has(a))links.set(a,[]);links.get(a).push(b)}
 }
 if([...links.values()].some(v=>v.length!==2))throw Error('Invalid boundary adjacency');
 const start=[...links.keys()].sort((a,b)=>points.get(a)[0]-points.get(b)[0]||points.get(a)[1]-points.get(b)[1])[0];
 let previous=null,current=start;const result=[];
 do{
  result.push(points.get(current));const next=links.get(current).find(k=>k!==previous);
  previous=current;current=next;
  if(result.length>links.size)throw Error('Boundary did not close');
 }while(current!==start);
 return signedArea(result)>0?result:result.reverse();
}
const A=build(adjA),B=build(adjB),outlineA=boundary(A),outlineB=boundary(B);
const landmarks=base.map(p=>[p[0]-center[0],p[1]-center[1]]);
function transform(p,pose={}){
 const a=(pose.angle||0)*Math.PI/180,c=Math.cos(a),s=Math.sin(a),x=pose.flipped?-p[0]:p[0],y=p[1];
 return [c*x-s*y+(pose.x||0),s*x+c*y+(pose.y||0)];
}
function transformed(tiles,pose){return tiles.map(t=>t.map(p=>transform(p,pose)))}
// Sutherland–Hodgman clipping of one convex triangle by another.
function intersection(subject,clip){
 let out=subject.map(p=>p.slice());const polygon=signedArea(clip)>0?clip:clip.slice().reverse();
 for(let i=0;i<polygon.length&&out.length;i++){
  const a=polygon[i],b=polygon[(i+1)%polygon.length],input=out;out=[];
  let prev=input[input.length-1],dp=cross(a,b,prev);
  for(const cur of input){
   const dc=cross(a,b,cur),inside=dc>=-EPS,wasInside=dp>=-EPS;
   if(inside!==wasInside){const t=dp/(dp-dc);out.push([prev[0]+t*(cur[0]-prev[0]),prev[1]+t*(cur[1]-prev[1])])}
   if(inside)out.push(cur);prev=cur;dp=dc;
  }
 }
 return out;
}
function overlap(tilesA,tilesB){
 let common=0;for(const a of tilesA)for(const b of tilesB){const p=intersection(a,b);if(p.length>2)common+=area(p)}
 return Math.max(0,Math.min(common,tilesA.reduce((s,t)=>s+area(t),0),tilesB.reduce((s,t)=>s+area(t),0)));
}
function contains(point,tiles){return tiles.some(t=>{const signs=t.map((p,i)=>cross(p,t[(i+1)%3],point));return signs.every(s=>s>=-EPS)||signs.every(s=>s<=EPS)})}
function concaveVertices(polygon){return polygon.filter((p,i)=>cross(polygon[(i+polygon.length-1)%polygon.length],p,polygon[(i+1)%polygon.length])<-EPS)}
const witness=A[5][0];
const api={base,center,A,B,outlineA,outlineB,landmarks,witness,area,signedArea,distance,cross,reflect,build,boundary,transform,transformed,intersection,overlap,contains,concaveVertices};
if(typeof module==='object'&&module.exports)module.exports=api;else root.DrumCongruence=api;
})(typeof globalThis!=='undefined'?globalThis:this);
