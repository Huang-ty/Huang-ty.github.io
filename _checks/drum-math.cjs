const assert=require('node:assert/strict');
const M=require('../projects/hear-the-shape/math.js');
const near=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
for(const m of [1,2,3]){
 near(M.relativeFrequency(m,1,2),M.relativeFrequency(m)/2);
 near(M.eigenvalue(m,1,2),M.eigenvalue(m)/4);
 for(const [x,y] of [[0,.31],[2,.68],[.63,0],[1.17,1]])near(M.shape(x,y,m),0);
 for(let k=1;k<m;k++)near(M.shape(2*k/m,.43,m),0);
}

// Independent enumeration includes each (m,n) pair, including degeneracies.
function brute(a,b,cutoff){let count=0;for(let m=1;m<=Math.ceil(a*Math.sqrt(cutoff)/Math.PI);m++)for(let n=1;n<=Math.ceil(b*Math.sqrt(cutoff)/Math.PI);n++)if(Math.PI**2*((m/a)**2+(n/b)**2)<=cutoff+1e-9)count++;return count}
for(const [a,b] of [[4,1],[2,2],[2,1],[1.2,2.7]])for(const c of [0,8,80,800,8000,Math.PI**2*1.25]){
 assert.equal(M.countModes(a,b,c),brute(a,b,c));
 assert.equal(M.countModes(2*a,2*b,c),M.countModes(a,b,4*c));
}
assert.equal(M.countModes(2,2,Math.PI**2*1.25),3);
assert.equal(M.countModes(4,1,80),18);
assert.equal(M.countModes(2,2,8000),2490);
for(const [a,b] of [[4,1],[2,2]])assert.ok(Math.abs(M.areaEstimate(a,b,8000)-4)<Math.abs(M.areaEstimate(a,b,80)-4));
assert.throws(()=>M.countModes(0,2,80),RangeError);

// Exact integer intertwining check for all three edge colors.
const left=[[[0,1],[2,5]],[[0,2],[4,3]],[[0,4],[1,6]]];
const right=[[[0,4],[2,3]],[[0,1],[4,6]],[[0,2],[1,5]]];
function signed(pairs){const a=Array.from({length:7},(_,i)=>Array.from({length:7},(_,j)=>i===j?-1:0));for(const [i,j] of pairs){a[i][i]=a[j][j]=0;a[i][j]=a[j][i]=1}return a}
function mul(a,b){return a.map(row=>b[0].map((_,j)=>row.reduce((v,x,k)=>v+x*b[k][j],0)))}
for(let c=0;c<3;c++)assert.deepEqual(mul(M.transplant,signed(left[c])),mul(signed(right[c]),M.transplant));
function det(a){if(a.length===1)return a[0][0];return a[0].reduce((v,x,j)=>v+(-1)**j*x*det(a.slice(1).map(row=>row.filter((_,k)=>k!==j))),0)}
const determinant=det(M.transplant);assert.notEqual(determinant,0);
assert.deepEqual(M.transplant[0],[0,1,1,0,1,0,0]);
assert.deepEqual(M.transplant[4],[1,0,0,0,-1,1,0]);
assert.ok(M.transplant.every(row=>row.filter(Boolean).length===3));
console.log(`PASS: membrane boundaries/scaling; independent mode counts and multiplicity; all exact signed adjacency identities; transplantation determinant ${determinant}.`);
