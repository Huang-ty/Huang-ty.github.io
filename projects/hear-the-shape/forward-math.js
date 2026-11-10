/* P1 finite elements with a row-sum lumped mass matrix, homogeneous Dirichlet
   data, block inverse iteration and Rayleigh–Ritz projection. No external runtime.
   This approximates the positive continuum operator -Delta; it is not a proof
   of isospectrality or a computation of the complete infinite spectrum. */
(function(root){
'use strict';
const EPS=1e-10;
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const signedArea=p=>p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[1]-a[1]*b[0]},0)/2;
function polygonError(code){const e=new Error(code);e.code=code;return e}
function onSegment(p,a,b){return Math.abs(cross(a,b,p))<EPS&&p[0]>=Math.min(a[0],b[0])-EPS&&p[0]<=Math.max(a[0],b[0])+EPS&&p[1]>=Math.min(a[1],b[1])-EPS&&p[1]<=Math.max(a[1],b[1])+EPS}
function segmentsMeet(a,b,c,d){
 const x=cross(a,b,c),y=cross(a,b,d),z=cross(c,d,a),w=cross(c,d,b);
 return ((x>EPS&&y<-EPS||x<-EPS&&y>EPS)&&(z>EPS&&w<-EPS||z<-EPS&&w>EPS))||onSegment(c,a,b)||onSegment(d,a,b)||onSegment(a,c,d)||onSegment(b,c,d);
}
function cleanPolygon(input){
 if(!Array.isArray(input)||input.length<3)throw polygonError('vertices');
 if(input.length>16)throw polygonError('too-many');
 let p=input.map(a=>[Number(a[0]),Number(a[1])]);
 if(p.some(a=>!a.every(Number.isFinite)))throw polygonError('vertices');
 for(let i=0;i<p.length;i++)for(let j=i+1;j<p.length;j++)if(distance(p[i],p[j])<1e-7)throw polygonError('duplicate');
 for(let i=0;i<p.length;i++)for(let j=i+1;j<p.length;j++){
  if(j===i+1||i===0&&j===p.length-1)continue;
  if(segmentsMeet(p[i],p[(i+1)%p.length],p[j],p[(j+1)%p.length]))throw polygonError('self-intersection');
 }
 // Remove a redundant point only when it lies between its two neighbors.
 let change=true;
 while(change&&p.length>3){
  change=false;
  for(let i=0;i<p.length;i++){
   const a=p[(i+p.length-1)%p.length],b=p[i],c=p[(i+1)%p.length];
   if(Math.abs(cross(a,b,c))<EPS&&onSegment(b,a,c)){p.splice(i,1);change=true;break}
  }
 }
 const area=signedArea(p);
 if(Math.abs(area)<1e-6)throw polygonError('area');
 if(area<0)p.reverse();
 return p;
}
function inTriangle(p,a,b,c){return cross(a,b,p)>=-EPS&&cross(b,c,p)>=-EPS&&cross(c,a,p)>=-EPS}
function triangulate(p){
 const indices=p.map((_,i)=>i),out=[];
 while(indices.length>3){
  let found=false;
  for(let k=0;k<indices.length;k++){
   const i=indices[(k+indices.length-1)%indices.length],j=indices[k],l=indices[(k+1)%indices.length];
   if(cross(p[i],p[j],p[l])<=EPS)continue;
   if(indices.some(v=>v!==i&&v!==j&&v!==l&&inTriangle(p[v],p[i],p[j],p[l])))continue;
   out.push([i,j,l]);indices.splice(k,1);found=true;break;
  }
  if(!found)throw polygonError('triangulation');
 }
 out.push(indices.slice());
 // Uniform refinement does not cure a degenerate root triangle.
 for(const t of out)for(let i=0;i<3;i++){
  const a=p[t[i]],b=p[t[(i+1)%3]],c=p[t[(i+2)%3]];
  const sine=Math.abs(cross(a,b,c))/(distance(a,b)*distance(a,c));
  if(sine<.018)throw polygonError('thin');
 }
 return out;
}
const edgeKey=(i,j)=>i<j?i+','+j:j+','+i;
function makeMesh(input,quality='quick'){
 const polygon=cleanPolygon(input),nodes=polygon.map(p=>p.slice());
 let triangles=triangulate(polygon),boundary=nodes.map(()=>true);
 let edges=new Set(polygon.map((_,i)=>edgeKey(i,(i+1)%polygon.length)));
 const target=quality==='fine'?4096:1024;let levels=0;
 while(triangles.length*4<=target&&levels<6){
  const mids=new Map(),nextEdges=new Set(),next=[];
  const middle=(i,j)=>{
   const k=edgeKey(i,j);if(mids.has(k))return mids.get(k);
   const n=nodes.length;nodes.push([(nodes[i][0]+nodes[j][0])/2,(nodes[i][1]+nodes[j][1])/2]);
   const fixed=edges.has(k);boundary.push(fixed);
   if(fixed){nextEdges.add(edgeKey(i,n));nextEdges.add(edgeKey(n,j))}
   mids.set(k,n);return n;
  };
  for(const [a,b,c] of triangles){const ab=middle(a,b),bc=middle(b,c),ca=middle(c,a);next.push([a,ab,ca],[ab,b,bc],[ca,bc,c],[ab,bc,ca])}
  triangles=next;edges=nextEdges;levels++;
 }
 const area=Math.abs(signedArea(polygon));
 const perimeter=polygon.reduce((s,a,i)=>s+distance(a,polygon[(i+1)%polygon.length]),0);
 return {polygon,nodes,triangles,boundary,area,perimeter,levels};
}
function assemble(mesh){
 const {nodes,triangles,boundary}=mesh,free=new Int32Array(nodes.length).fill(-1);let n=0;
 for(let i=0;i<nodes.length;i++)if(!boundary[i])free[i]=n++;
 if(n<9)throw polygonError('resolution');
 const rows=Array.from({length:n},()=>new Map()),mass=new Float64Array(nodes.length);
 for(const t of triangles){
  const p=t.map(i=>nodes[i]),twice=cross(p[0],p[1],p[2]),area=twice/2;
  if(area<=0)throw polygonError('triangulation');
  const gx=p.map((_,i)=>(p[(i+1)%3][1]-p[(i+2)%3][1])/twice);
  const gy=p.map((_,i)=>(p[(i+2)%3][0]-p[(i+1)%3][0])/twice);
  for(let i=0;i<3;i++){
   mass[t[i]]+=area/3;const row=free[t[i]];if(row<0)continue;
   for(let j=0;j<3;j++){
    const col=free[t[j]];if(col<0)continue;
    const value=area*(gx[i]*gx[j]+gy[i]*gy[j]);rows[row].set(col,(rows[row].get(col)||0)+value);
   }
  }
 }
 const invSqrtMass=new Float64Array(n);
 for(let i=0;i<nodes.length;i++)if(free[i]>=0)invSqrtMass[free[i]]=1/Math.sqrt(mass[i]);
 const ptr=new Int32Array(n+1),cols=[],values=[],diagonal=new Float64Array(n);
 for(let i=0;i<n;i++){
  ptr[i]=cols.length;
  for(const [j,k] of rows[i]){
   const a=k*invSqrtMass[i]*invSqrtMass[j];if(Math.abs(a)<1e-14)continue;
   cols.push(j);values.push(a);if(j===i)diagonal[i]=a;
  }
  if(!(diagonal[i]>0))throw polygonError('matrix');
 }
 ptr[n]=cols.length;
 return {n,ptr,cols:Int32Array.from(cols),values:Float64Array.from(values),diagonal,free,mass,invSqrtMass};
}
function multiply(A,x,out=new Float64Array(A.n)){
 for(let i=0;i<A.n;i++){let v=0;for(let k=A.ptr[i];k<A.ptr[i+1];k++)v+=A.values[k]*x[A.cols[k]];out[i]=v}
 return out;
}
function dot(x,y){let s=0;for(let i=0;i<x.length;i++)s+=x[i]*y[i];return s}
const norm=x=>Math.sqrt(dot(x,x));
function orthonormalize(vectors){
 const out=[];
 for(const source of vectors){
  const v=Float64Array.from(source);
  for(let pass=0;pass<2;pass++)for(const q of out){const projection=dot(q,v);for(let i=0;i<v.length;i++)v[i]-=projection*q[i]}
  const length=norm(v);if(length<1e-13)throw polygonError('rank');
  for(let i=0;i<v.length;i++)v[i]/=length;out.push(v);
 }
 return out;
}
function cg(A,b,initial){
 const n=A.n,x=initial?Float64Array.from(initial):new Float64Array(n),ax=multiply(A,x),r=new Float64Array(n),z=new Float64Array(n),p=new Float64Array(n),ap=new Float64Array(n);
 for(let i=0;i<n;i++){r[i]=b[i]-ax[i];z[i]=r[i]/A.diagonal[i];p[i]=z[i]}
 const target=2e-10*Math.max(norm(b),1e-30);let rz=dot(r,z);
 if(norm(r)<=target)return x;
 for(let iteration=0;iteration<Math.min(700,n*2+20);iteration++){
  multiply(A,p,ap);const pap=dot(p,ap);if(!(pap>0))throw polygonError('linear-solve');
  const alpha=rz/pap;
  for(let i=0;i<n;i++){x[i]+=alpha*p[i];r[i]-=alpha*ap[i]}
  if(norm(r)<=target)return x;
  for(let i=0;i<n;i++)z[i]=r[i]/A.diagonal[i];
  const next=dot(r,z),beta=next/rz;
  for(let i=0;i<n;i++)p[i]=z[i]+beta*p[i];rz=next;
 }
 const actual=multiply(A,x);for(let i=0;i<n;i++)actual[i]-=b[i];
 if(norm(actual)>2e-7*Math.max(norm(b),1e-30))throw polygonError('linear-solve');
 return x;
}
function symmetricEigen(matrix){
 const n=matrix.length,a=matrix.map(row=>Float64Array.from(row));
 const vectors=Array.from({length:n},(_,i)=>Float64Array.from({length:n},(_,j)=>i===j?1:0));
 for(let sweep=0;sweep<90;sweep++){
  let largest=0,scale=0;for(let i=0;i<n;i++)scale=Math.max(scale,Math.abs(a[i][i]));
  for(let p=0;p<n;p++)for(let q=p+1;q<n;q++){
   const apq=a[p][q];largest=Math.max(largest,Math.abs(apq));if(Math.abs(apq)<1e-14*Math.max(scale,1))continue;
   const tau=(a[q][q]-a[p][p])/(2*apq),t=(tau>=0?1:-1)/(Math.abs(tau)+Math.hypot(1,tau)),c=1/Math.sqrt(1+t*t),s=t*c;
   const app=a[p][p],aqq=a[q][q];a[p][p]=app-t*apq;a[q][q]=aqq+t*apq;a[p][q]=a[q][p]=0;
   for(let i=0;i<n;i++){
    if(i!==p&&i!==q){const x=a[i][p],y=a[i][q];a[i][p]=a[p][i]=c*x-s*y;a[i][q]=a[q][i]=s*x+c*y}
    const x=vectors[i][p],y=vectors[i][q];vectors[i][p]=c*x-s*y;vectors[i][q]=s*x+c*y;
   }
  }
  if(largest<1e-12*Math.max(scale,1))break;
 }
 const order=Array.from({length:n},(_,i)=>i).sort((i,j)=>a[i][i]-a[j][j]);
 return {values:order.map(i=>a[i][i]),vectors:order.map(j=>Float64Array.from({length:n},(_,i)=>vectors[i][j]))};
}
function solvePolygon(input,options={}){
 const started=Date.now(),mesh=makeMesh(input,options.quality),A=assemble(mesh),count=Math.min(options.count||6,A.n),block=Math.min(count+3,A.n);
 let seed=736127;const random=()=>{seed=(Math.imul(1664525,seed)+1013904223)|0;return (seed>>>0)/4294967296-.5};
 let X=orthonormalize(Array.from({length:block},()=>Float64Array.from({length:A.n},random))),eigenvalues=null,residuals=[],iterations=0,AX;
 const tolerance=options.tolerance||3e-5,maxIterations=options.maxIterations||48;
 for(let iteration=0;iteration<maxIterations;iteration++){
  const Y=X.map((x,j)=>cg(A,x,eigenvalues?Float64Array.from(x,v=>v/eigenvalues[j]):null)),Z=orthonormalize(Y),AZ=Z.map(x=>multiply(A,x));
  const H=Array.from({length:block},(_,i)=>Array.from({length:block},(_,j)=>(dot(Z[i],AZ[j])+dot(Z[j],AZ[i]))/2));
  const small=symmetricEigen(H);eigenvalues=small.values;
  const rotate=columns=>small.vectors.map(v=>{
   const out=new Float64Array(A.n);
   for(let j=0;j<block;j++)for(let i=0;i<A.n;i++)out[i]+=columns[j][i]*v[j];return out;
  });
  X=rotate(Z);AX=rotate(AZ);residuals=[];
  for(let j=0;j<count;j++){
   let sum=0;for(let i=0;i<A.n;i++){const d=AX[j][i]-eigenvalues[j]*X[j][i];sum+=d*d}
   residuals.push(Math.sqrt(sum)/Math.abs(eigenvalues[j]));
  }
  iterations=iteration+1;
  if(options.onProgress&&iteration%3===0)options.onProgress({iteration:iterations,residual:Math.max(...residuals),nodes:A.n});
  if(residuals.every(r=>r<tolerance))break;
 }
 if(!residuals.every(r=>r<tolerance)||eigenvalues.some(v=>!Number.isFinite(v)||v<=0))throw polygonError('convergence');
 const modes=X.slice(0,count).map(v=>{
  const phi=new Float64Array(mesh.nodes.length);let pivot=0;
  for(let i=0;i<phi.length;i++)if(A.free[i]>=0){phi[i]=v[A.free[i]]*A.invSqrtMass[A.free[i]];if(Math.abs(phi[i])>Math.abs(phi[pivot]))pivot=i}
  if(phi[pivot]<0)for(let i=0;i<phi.length;i++)phi[i]*=-1;
  return phi;
 });
 return {...mesh,eigenvalues:eigenvalues.slice(0,count),modes,residuals,iterations,freeNodes:A.n,elapsedMs:Date.now()-started,method:'P1 FEM / row-sum lumped mass / block inverse iteration',count};
}
const presets={square:[[1,.5],[3,.5],[3,2.5],[1,2.5]],rectangle:[[1,1],[3,1],[3,2],[1,2]],triangle:[[1,.5],[3,.5],[1,2.5]],ell:[[1,.5],[3,.5],[3,1.3],[1.8,1.3],[1.8,2.5],[1,2.5]]};
const api={cross,distance,signedArea,cleanPolygon,triangulate,makeMesh,assemble,multiply,dot,norm,orthonormalize,cg,symmetricEigen,solvePolygon,presets};
if(typeof module==='object'&&module.exports)module.exports=api;else root.DrumForwardMath=api;
})(typeof globalThis!=='undefined'?globalThis:this);
