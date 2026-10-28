(function(){
'use strict';
const M=window.DrumMath,$=id=>document.getElementById(id);
function area(cutoff,announce){
 const longCount=M.countModes(4,1,cutoff),squareCount=M.countModes(2,2,cutoff);
 const longArea=M.areaEstimate(4,1,cutoff).toFixed(2),squareArea=M.areaEstimate(2,2,cutoff).toFixed(2);
 $('area-count-long').textContent=longCount;$('area-count-square').textContent=squareCount;
 $('area-estimate-long').textContent=longArea;$('area-estimate-square').textContent=squareArea;
 $('cutoff-label').textContent=`Eigenvalue cutoff Λ = ${cutoff.toLocaleString('en-US')}. Repeated eigenvalues are counted separately.`;
 document.querySelectorAll('[data-cutoff]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.cutoff)===cutoff)));
 if(announce)$('area-status').textContent=`Cutoff ${cutoff}: estimated areas ${longArea} and ${squareArea}. Both true areas are 4 square units.`;
}
const sub=['₀','₁','₂','₃','₄','₅','₆'];
function transfer(k){
 const row=M.transplant[k],terms=[];
 row.forEach((v,i)=>{if(v)terms.push(`${terms.length?(v>0?' + ':' − '):(v<0?'−':'')}f${sub[i]}`)});
 $('transfer-equation').textContent=`g${sub[k]} = ${terms.join('')}`;
 const plus=row.flatMap((v,i)=>v>0?[i]:[]),minus=row.flatMap((v,i)=>v<0?[i]:[]);
 $('transfer-explanation').textContent=`Align the source pieces with target triangle ${k}. Add pieces ${plus.join(' and ')}${minus.length?`, then subtract piece ${minus.join(' and ')}`:''}, point by point.`;
 document.querySelectorAll('[data-target]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.target)===k)));
 document.querySelectorAll('.transfer-tile,.transfer-label').forEach(el=>{
  const i=Number(el.dataset.tile),source=el.dataset.side==='source',v=source?row[i]:Number(i===k);
  el.classList.toggle('add-piece',source&&v>0);el.classList.toggle('subtract-piece',source&&v<0);el.classList.toggle('target-piece',!source&&v>0);
  if(el.classList.contains('transfer-label'))el.textContent=(source?(v>0?'+':v<0?'−':''):'')+(source?'f':'g')+sub[i];
 });
}
document.querySelectorAll('[data-cutoff]').forEach(b=>b.addEventListener('click',()=>area(Number(b.dataset.cutoff),true)));
document.querySelectorAll('[data-target]').forEach(b=>b.addEventListener('click',()=>transfer(Number(b.dataset.target))));
area(80,false);transfer(0);
})();
