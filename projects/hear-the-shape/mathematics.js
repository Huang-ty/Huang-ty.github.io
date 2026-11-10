/* Mathematical readouts share the experiment state. Only equations are
   re-typeset, on changes to a mode, geometry, scale, cutoff or placement. */
(function(root){
'use strict';
const reference=1.25*Math.PI**2,decimal=(x,n=3)=>Number(x).toFixed(n);
function fraction(n,d){
 const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
 if(!Number.isInteger(n)||!Number.isInteger(d))return {tex:`\\frac{${n}}{${d}}`,plain:`${n}/${d}`};
 const g=gcd(n,d);n/=g;d/=g;return {tex:d===1?String(n):`\\frac{${n}}{${d}}`,plain:d===1?String(n):`${n}/${d}`};
}
function rectangleModel(m,scale){
 const a=2*scale,b=scale,q=m*m/(a*a)+1/(b*b),lambda=Math.PI**2*q;
 return {m,a,b,q,lambda,fraction:fraction(m*m+4,4*scale*scale),ratio:Math.sqrt(q/1.25),pitch:220*Math.sqrt(q/1.25),nodes:Array.from({length:m-1},(_,i)=>(i+1)*a/m),nodeLabels:Array.from({length:m-1},(_,i)=>fraction((i+1)*a,m).plain)};
}
function forwardModel(result,k){
 const lambda=result.eigenvalues[k];return {lambda,first:result.eigenvalues[0],ratio:Math.sqrt(lambda/result.eigenvalues[0]),pitch:220*Math.sqrt(lambda/reference),n:result.freeNodes,triangles:result.triangles.length,k:k+1};
}
function areaModel(cutoff,n1,n2){return {cutoff,n1,n2,a1:4*Math.PI*n1/cutoff,a2:4*Math.PI*n2/cutoff}}
function transferTerms(k,row,coordinates=false){
 let out='';row.forEach((v,j)=>{if(v)out+=(out?(v>0?'+':'-'):(v<0?'-':''))+`f_{${j}}`+(coordinates?`(\\tau_{${k}${j}}(x))`:'')});return out;
}
const api={rectangleModel,forwardModel,areaModel,transferTerms};
if(typeof module==='object'&&module.exports){module.exports=api;return}
let ready=false,busy=false,timer;const pending=new Set();
function schedule(){clearTimeout(timer);if(ready)timer=setTimeout(flush,80)}
function equation(id,tex,plain){
 const el=document.getElementById(id);if(!el)return;
 if(el.dataset.mathTex===tex)return;
 el.dataset.mathTex=tex;el.dataset.mathFallback=plain;
 if(!ready)el.textContent=plain;pending.add(el);schedule();
}
async function flush(){
 if(!ready||busy||!pending.size)return;
 const batch=[...pending].filter(e=>e.isConnected);pending.clear();if(!batch.length)return;
 busy=true;
 try{
  MathJax.typesetClear(batch);
  batch.forEach(el=>{if(!el.dataset.mathFallback)el.dataset.mathFallback=el.textContent;el.textContent='\\['+el.dataset.mathTex+'\\]'});
  await MathJax.typesetPromise(batch);
 }catch(e){batch.forEach(el=>{el.textContent=el.dataset.mathFallback||'See the accompanying explanation.'})}
 finally{busy=false;if(pending.size)schedule()}
}
function prose(id,en,zh,lang='en'){const el=document.getElementById(id);if(el)el.textContent=lang==='zh'?zh:en}
function forward(result,selected,lang='en'){
 if(!result){
  equation('math-forward-live',String.raw`-\Delta\phi=\lambda\phi\quad\longrightarrow\quad K\mathbf v=\widehat\lambda M_{\rm lump}\mathbf v`,'−Δφ = λφ → K v = λ̂ M_lump v');
  prose('math-forward-reading','Draw the domain Ω and fix its boundary. Computing turns the differential equation into a matrix eigenvalue problem; selecting a row chooses one approximate eigenpair.','画出的轮廓定义区域 Ω，并固定边界。计算把微分方程变成矩阵特征值问题；选择一行，就是选择一个近似特征对。',lang);return;
 }
 const v=forwardModel(result,selected);
 equation('math-forward-live',`\\begin{aligned}\\widehat\\lambda_{${v.k}}&\\approx ${decimal(v.lambda)}\\\\\\frac{f_{${v.k}}}{f_1}&\\approx\\sqrt{\\frac{${decimal(v.lambda)}}{${decimal(v.first)}}}\\approx ${decimal(v.ratio)}\\end{aligned}`,`λ̂${v.k} ≈ ${decimal(v.lambda)} → f${v.k}/f₁ ≈ √(${decimal(v.lambda)}/${decimal(v.first)}) ≈ ${decimal(v.ratio)}`);
 prose('math-forward-reading',`${v.triangles.toLocaleString()} triangles; ${v.n.toLocaleString()} free nodal values. K and M_lump are ${v.n} × ${v.n} matrices. The selected spatial pattern is φ_h = Σ vᵢNᵢ; its illustrative tone is about ${decimal(v.pitch,1)} Hz. A small matrix residual checks this discrete problem, not the continuum error.`,`${v.triangles.toLocaleString()} 个三角形，${v.n.toLocaleString()} 个自由节点值；K 与 M_lump 是 ${v.n} × ${v.n} 矩阵。所选空间振型是 φ_h=ΣvᵢNᵢ，示范音高约 ${decimal(v.pitch,1)} Hz。矩阵残差小，只检验离散问题，不是连续问题的误差上界。`,lang);
}
function rectangle(m,scale){
 const v=rectangleModel(m,scale);
 equation('math-rectangle-live',`\\begin{aligned}\\phi_{${m}1}(x,y)&=\\sin\\!\\left(\\frac{${m}\\pi x}{${v.a}}\\right)\\sin\\!\\left(\\frac{\\pi y}{${v.b}}\\right)\\\\\\lambda_{${m}1}&=\\pi^2\\!\\left(\\frac{${m}^2}{${v.a}^2}+\\frac{1}{${v.b}^2}\\right)=${v.fraction.tex}\\pi^2\\end{aligned}`,`φ${m}1 = sin(${m}πx/${v.a}) sin(πy/${v.b}); λ${m}1 = (${v.fraction.plain})π²`);
 prose('math-rectangle-reading',`Current rectangle: a = ${v.a}, b = ${v.b}; mode (m,n) = (${m},1). ${v.nodes.length?'Interior nodal lines: '+v.nodeLabels.map(x=>'x = '+x).join(', ')+'.':'There are no interior nodal lines.'} f / f₁,original = √((${v.fraction.plain}) / (5/4)) ≈ ${decimal(v.ratio)}; the illustrative tone is ${decimal(v.pitch,1)} Hz.`, '');
 equation('math-scale-live',`s=${scale}:\\quad \\lambda_{${m}1}(s\\Omega)=\\frac{\\lambda_{${m}1}(\\Omega)}{${scale}^2},\\qquad f_{${m}1}(s\\Omega)=\\frac{f_{${m}1}(\\Omega)}{${scale}}`,`s=${scale}: eigenvalue ÷ ${scale**2}; frequency ÷ ${scale}`);
}
function area(cutoff,n1,n2){
 const a=areaModel(cutoff,n1,n2);
 equation('math-area-live',`\\begin{aligned}A_{4\\times1}^{\\rm est}&=\\frac{4\\pi\\cdot ${n1}}{${cutoff}}\\approx ${decimal(a.a1,2)}\\\\A_{2\\times2}^{\\rm est}&=\\frac{4\\pi\\cdot ${n2}}{${cutoff}}\\approx ${decimal(a.a2,2)}\\end{aligned}`,`At Λ=${cutoff}: 4π×${n1}/${cutoff} ≈ ${decimal(a.a1,2)}; 4π×${n2}/${cutoff} ≈ ${decimal(a.a2,2)}`);
 prose('math-area-reading',`At cutoff Λ = ${cutoff.toLocaleString()}, count ${n1.toLocaleString()} and ${n2.toLocaleString()} independent modes, including repeated eigenvalues. Substitute these counts into 4πN(Λ)/Λ. Both exact areas are 4; finite-cutoff estimates need not improve at every small increase of Λ.`, '');
}
function transfer(k,row){
 const terms=transferTerms(k,row);
 equation('math-transfer-live',`g_{${k}}(x)=${transferTerms(k,row,true)}`,`g${k}(x) = ${terms}; every source function is geometrically aligned first.`);
 equation('math-transfer-operator',`-\\Delta g_{${k}}=\\sum_j T_{${k}j}\\bigl[(-\\Delta f_j)\\circ\\tau_{${k}j}\\bigr]=\\lambda g_{${k}}`,`−Δg${k} = ΣⱼT${k}j[(−Δfⱼ)∘τ${k}j] = λg${k}`);
 prose('math-transfer-reading',`Target ${k}: the coefficients are a row of the linear transplantation map T. Every term comes from the same λ-eigenfunction. Linearity preserves λ locally; matching values and derivatives in a common normal direction across seams, and zero values on the outer boundary, are still required.`, '');
}
function congruence(pose,lang){
 equation('math-congruence-live',`p'=R(${pose.angle}^\\circ)\\,${pose.flipped?'\\operatorname{diag}(-1,1)':'I'}\\,p+\\binom{${decimal(pose.x,2)}}{${decimal(pose.y,2)}}`,`p′ = R(${pose.angle}°) ${pose.flipped?'diag(−1,1)':'I'} p + (${decimal(pose.x,2)}, ${decimal(pose.y,2)})`);
 prose('math-congruence-reading','The sliders change an isometry, so distances and angles are preserved. Overlap measures this placement. To rule out every placement, the proof fixes the only possible correspondence of the three inward corners, then checks the remaining outline.','滑块改变的是等距变换，所以距离和角度保持不变。重合比例只描述当前摆法；要排除所有摆法，必须先用三个凹角固定唯一可能的对应，再检查剩余轮廓。',lang);
}
root.DrumMathUI={...api,forward,rectangle,area,transfer,congruence,ready(){ready=true;document.querySelectorAll('[data-math-tex]').forEach(el=>pending.add(el));return flush()}};
root.MathJax={
 tex:{inlineMath:[['\\(','\\)']],displayMath:[['\\[','\\]']]},
 chtml:{fontURL:'/assets/vendor/mathjax/output/chtml/fonts/woff-v2'},
 options:{enableMenu:false},startup:{typeset:false,pageReady(){return MathJax.startup.defaultPageReady().then(()=>root.DrumMathUI.ready())}}
};
document.addEventListener('toggle',event=>{if(event.target.tagName==='DETAILS'&&event.target.open){event.target.querySelectorAll('[data-math-tex]').forEach(el=>pending.add(el));schedule()}},true);
})(typeof globalThis!=='undefined'?globalThis:this);
