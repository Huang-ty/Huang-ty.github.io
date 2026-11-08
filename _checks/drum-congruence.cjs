const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const M=require('../projects/hear-the-shape/congruence-math.js');
const near=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
for(const [tiles,outline] of [[M.A,M.outlineA],[M.B,M.outlineB]]){
 assert.equal(tiles.length,7);assert.equal(outline.length,9);
 for(const t of tiles)near(M.area(t),.7);
 near(M.area(outline),4.9);
 const inward=M.concaveVertices(outline);assert.equal(inward.length,3);
 for(const p of M.landmarks)assert.ok(inward.some(q=>M.distance(p,q)<1e-8));
 // Every pair of distinct construction triangles has zero interior overlap.
 for(let i=0;i<7;i++)for(let j=i+1;j<7;j++)near(M.overlap([tiles[i]],[tiles[j]]),0);
}
near(M.overlap(M.A,M.B),2.8);near(M.overlap(M.A,M.B)/4.9,4/7);
near(M.overlap(M.A,M.B),M.overlap(M.B,M.A));
near(M.overlap(M.A,M.A),4.9);near(M.overlap(M.B,M.B),4.9);
near(M.overlap(M.transformed(M.A,{x:20}),M.B),0);
assert.ok(M.contains(M.witness,M.A));assert.equal(M.contains(M.witness,M.B),false);
for(const pose of [{angle:47,x:.3,y:-.8},{angle:-133,x:.2,y:.6,flipped:true},{angle:180,flipped:true}]){
 const a=M.transformed(M.A,pose),b=M.transformed(M.B,pose);
 near(a.reduce((s,t)=>s+M.area(t),0),4.9);
 near(M.overlap(a,b),2.8);
 near(M.overlap(a,M.B),M.overlap(M.B,a));
}
// Exact squared side lengths times 400 are 784, 761 and 481: all distinct.
const p=M.landmarks;
assert.deepEqual([[0,1],[1,2],[2,0]].map(([a,b])=>Math.round(400*M.distance(p[a],p[b])**2)),[784,761,481]);
const permutations=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
const valid=permutations.filter(perm=>[[0,1],[1,2],[2,0]].every(([i,j])=>Math.abs(M.distance(p[i],p[j])-M.distance(p[perm[i]],p[perm[j]]))<1e-8));
assert.deepEqual(valid,[[0,1,2]]);
// Independently compare all coordinates with the already published SVG asset.
for(const [side,tiles,offset] of [['0',M.A,170.89053],['1',M.B,700.66859]]){
 const text=fs.readFileSync(path.join(__dirname,`../projects/hear-the-shape/assets/transfer-${side}.svg`),'utf8');
 const matches=[...text.matchAll(/<polygon[^>]*points="([^"]+)"[^>]*data-tile="(\d)"/g)];assert.equal(matches.length,7);
 for(const match of matches){
  const old=match[1].split(' ').map(s=>s.split(',').map(Number));
  const tile=tiles[Number(match[2])].map(p=>[offset+91*(p[0]+M.center[0]),224.63373-91*(p[1]+M.center[1])]);
  for(const v of tile)assert.ok(old.some(w=>M.distance(v,w)<.00002),'Published and new triangles disagree');
 }
}
console.log('PASS: 14 published triangle coordinates; areas and simple boundaries; exactly 3 inward corners; one distance-preserving corner matching out of 6; an unmatched boundary point; 4/7 canonical overlap; rigid-motion and reflection invariance; clipping symmetry, identity and disjointness.');
