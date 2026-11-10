/* Numerical validation against independent analytic solutions and invariants. */
const assert=require('node:assert/strict');
const M=require('../projects/hear-the-shape/forward-math.js');
const near=(a,b,t=1e-8)=>assert.ok(Math.abs(a-b)<=t,`${a} differs from ${b} by ${Math.abs(a-b)}`);
const rectangleSpectrum=(a,b)=>{
 const values=[];for(let m=1;m<=8;m++)for(let n=1;n<=8;n++)values.push(Math.PI**2*(m*m/(a*a)+n*n/(b*b)));
 return values.sort((x,y)=>x-y).slice(0,6);
};
const summaries=[];
for(const [name,a,b] of [['square',2,2],['rectangle',2,1],['triangle',2,null]]){
 let exact;
 if(b)exact=rectangleSpectrum(a,b);
 else{const values=[];for(let m=1;m<=8;m++)for(let n=m+1;n<=8;n++)values.push(Math.PI**2*(m*m+n*n)/4);exact=values.sort((x,y)=>x-y).slice(0,6)}
 const quick=M.solvePolygon(M.presets[name],{quality:'quick'}),fine=M.solvePolygon(M.presets[name],{quality:'fine'});
 for(let i=0;i<6;i++){
  const e0=Math.abs(quick.eigenvalues[i]/exact[i]-1),e1=Math.abs(fine.eigenvalues[i]/exact[i]-1);
  assert.ok(e1<.012,`${name} mode ${i+1} continuum error exceeds 1.2%`);
  assert.ok(e1<e0*.4,`${name} mode ${i+1} did not improve with refinement`);
 }
 assert.equal(fine.count,6);assert.ok(fine.eigenvalues.every((v,i,a)=>v>0&&(!i||v>=a[i-1])));
 const A=M.assemble(fine),x=fine.modes.map(v=>{
  const out=new Float64Array(A.n);for(let j=0;j<v.length;j++){
   if(fine.boundary[j])assert.ok(v[j]===0,'Dirichlet boundary value is not exactly zero');
   else out[A.free[j]]=v[j]*Math.sqrt(A.mass[j]);
  }return out;
 });
 for(let i=0;i<6;i++){
  near(M.dot(x[i],x[i]),1,1e-10);
  for(let j=0;j<i;j++)near(M.dot(x[i],x[j]),0,1e-10);
  const ax=M.multiply(A,x[i]);for(let k=0;k<A.n;k++)ax[k]-=fine.eigenvalues[i]*x[i][k];
  assert.ok(M.norm(ax)/fine.eigenvalues[i]<3.01e-5,'Independent eigenpair residual failed');
 }
 // On this square mesh the lumped FEM spectrum has an independent five-point formula.
 if(name==='square'){
  const intervals=2**fine.levels,h=2/intervals,discrete=[];
  for(let m=1;m<=8;m++)for(let n=1;n<=8;n++)discrete.push(4/h**2*(Math.sin(m*Math.PI/(2*intervals))**2+Math.sin(n*Math.PI/(2*intervals))**2));
  discrete.sort((a,b)=>a-b);for(let i=0;i<6;i++)near(fine.eigenvalues[i],discrete[i],2e-6);
  near(fine.eigenvalues[1],fine.eigenvalues[2],1e-8);
 }
 summaries.push(`${name}: refined λ₁ ${fine.eigenvalues[0].toFixed(6)}, ${fine.triangles.length} triangles`);
}
const base=M.solvePolygon(M.presets.ell,{quality:'quick'});
near(base.area,2.56); // 2×2 square minus a 1.2×1.2 corner.
near(base.triangles.reduce((s,t)=>s+M.cross(...t.map(i=>base.nodes[i]))/2,0),base.area);
const theta=.371,c=Math.cos(theta),s=Math.sin(theta);
const transformed=M.presets.ell.map(([x,y])=>[x*c-y*s+5,x*s+y*c-2]);
const rigid=M.solvePolygon(transformed,{quality:'quick'});
const scaled=M.solvePolygon(M.presets.ell.map(p=>p.map(v=>v*1.7)),{quality:'quick'});
for(let i=0;i<6;i++){near(rigid.eigenvalues[i],base.eigenvalues[i],2e-6);near(scaled.eigenvalues[i]*1.7**2,base.eigenvalues[i],2e-6)}
// Reflection invariance on the same triangulation; changing root triangulations
// can introduce a different finite-mesh error, even for congruent domains.
const mirrored={...base,nodes:base.nodes.map(([x,y])=>[-x,y]),triangles:base.triangles.map(([a,b,c])=>[a,c,b])};
const originalMatrix=M.assemble(base),mirroredMatrix=M.assemble(mirrored);
const probe=Float64Array.from({length:originalMatrix.n},(_,i)=>Math.sin(i*.37));
const y0=M.multiply(originalMatrix,probe),y1=M.multiply(mirroredMatrix,probe);
for(let i=0;i<y0.length;i++)near(y0[i],y1[i],1e-9);
const reverse=M.solvePolygon(M.presets.rectangle.slice().reverse(),{quality:'quick'});
const normal=M.solvePolygon(M.presets.rectangle,{quality:'quick'});
for(let i=0;i<6;i++)near(reverse.eigenvalues[i],normal.eigenvalues[i],2e-6);
for(const [p,code] of [
 [[[0,0],[2,2],[0,2],[2,0]],'self-intersection'],
 [[[0,0],[1,0],[1,0],[0,1]],'duplicate'],
 [[[0,0],[1,0]],'vertices'],
 [[[0,0],[1,0],[2,0]],'area']
])assert.throws(()=>M.cleanPolygon(p),e=>e.code===code);
assert.throws(()=>M.makeMesh([[0,0],[3,0],[1,.001]]),e=>e.code==='thin');
near(M.makeMesh([[0,0],[1,0],[2,0],[2,1],[0,1]]).area,2);
console.log('PASS: six-mode continuum benchmarks and refinement; independent square discrete eigenvalues; degeneracy and mass orthogonality; independently recomputed residuals; fixed boundaries; concave-domain area; scaling, rotation, reflection and translation; clockwise inputs; collinear cleanup; invalid and thin outlines.');
console.log(summaries.join('\n'));
