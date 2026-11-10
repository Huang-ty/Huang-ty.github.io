const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const UI=require('../projects/hear-the-shape/mathematics.js');
const M=require('../projects/hear-the-shape/math.js');
const F=require('../projects/hear-the-shape/forward-math.js');
const near=(x,y,t=1e-9)=>assert.ok(Math.abs(x-y)<t,`${x} != ${y}`);
for(const scale of [1,2])for(const m of [1,2,3]){
 const state=UI.rectangleModel(m,scale);
 near(state.lambda,M.eigenvalue(m,1,scale));near(state.ratio,M.relativeFrequency(m,1,scale));near(state.pitch,220*M.relativeFrequency(m,1,scale));
 assert.equal(state.nodes.length,m-1);
 for(const x of state.nodes)near(M.shape(x,scale/2,m,1,scale),0);
}
const enlarged=UI.rectangleModel(3,2);near(enlarged.q,13/16);near(enlarged.nodes[0],4/3);near(enlarged.nodes[1],8/3);
assert.deepEqual(enlarged.fraction,{tex:'\\frac{13}{16}',plain:'13/16'});assert.deepEqual(enlarged.nodeLabels,['4/3','8/3']);
for(const cutoff of [80,800,8000]){
 const n1=M.countModes(4,1,cutoff),n2=M.countModes(2,2,cutoff),state=UI.areaModel(cutoff,n1,n2);
 near(state.a1,M.areaEstimate(4,1,cutoff));near(state.a2,M.areaEstimate(2,2,cutoff));
}
const result=F.solvePolygon(F.presets.rectangle,{quality:'quick'}),state=UI.forwardModel(result,2);
near(state.lambda,result.eigenvalues[2]);near(state.ratio,Math.sqrt(result.eigenvalues[2]/result.eigenvalues[0]));assert.equal(state.n,225);
assert.equal(UI.transferTerms(0,M.transplant[0]),'f_{1}+f_{2}+f_{4}');
assert.equal(UI.transferTerms(4,M.transplant[4]),'f_{0}-f_{4}+f_{5}');
assert.equal(UI.transferTerms(4,M.transplant[4],true),'f_{0}(\\tau_{40}(x))-f_{4}(\\tau_{44}(x))+f_{5}(\\tau_{45}(x))');
const directory=path.join(__dirname,'../projects/hear-the-shape');
for(const [name,min]of [['index.html',40],['static.html',35],['non-congruent.html',3]]){
 const text=fs.readFileSync(path.join(directory,name),'utf8');assert.ok((text.match(/data-math-tex=/g)||[]).length>=min);
 const ids=[...text.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,`${name}: duplicate IDs`);
 assert.ok(text.includes('/assets/vendor/mathjax/tex-chtml.js'));
}
for(const [file,hook]of [['forward.js','DrumMathUI.forward'],['app.js','DrumMathUI.rectangle'],['explore.js','DrumMathUI.area'],['explore.js','DrumMathUI.transfer'],['congruence.js','DrumMathUI.congruence']])assert.ok(fs.readFileSync(path.join(directory,file),'utf8').includes(hook));
console.log('PASS: live formulas match analytic modes, nodal locations, scale and audio ratios; area substitutions match mode enumeration; FEM readouts use selected eigenpairs and matrix size; transplantation coordinates and signs; equation presence, unique IDs and all interaction hooks.');
