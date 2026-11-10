/* Polygon editor and view for the Dirichlet forward problem. Calculations run
   locally in a worker; drawn coordinates are never uploaded or persisted. */
(function(){
'use strict';
const root=document.getElementById('forward-lab');if(!root)return;
const M=window.DrumForwardMath,$=id=>document.getElementById('fwd-'+id);
const workerURL=new URL('forward-worker.js?v=20261110',document.currentScript.src);
const editor=$('editor'),canvas=$('mode-canvas'),ctx=canvas.getContext('2d');
const off=document.createElement('canvas');off.width=460;off.height=360;
const offctx=off.getContext('2d'),image=offctx.createImageData(460,360);
let polygon=M.presets.rectangle.map(p=>p.slice()),closed=true,history=[],preset='rectangle';
let lang='en',busy=false,result=null,selected=0,worker=null,requestId=0,timeout,drag=null;
let playing=false,raf=0,lastTime=0,phase=0,raster=null,active=[],boundaryPath=null,meshPath=null,nodePath=null;
let statusKind='ready',errorCode='',lastSolved=null,comparison=null;
const text=(en,zh)=>lang==='zh'?zh:en;
const clone=p=>p.map(v=>v.slice()),point=p=>[30+p[0]*100,330-p[1]*100];
const errors={
 vertices:['Use at least three finite vertex coordinates.','请至少输入三个有效顶点。'],
 'too-many':['Use at most 16 vertices.','最多支持 16 个顶点。'],
 duplicate:['Two vertices coincide. Move or remove one of them.','有两个顶点重合，请移动或删除其中一个。'],
 'self-intersection':['The boundary crosses or touches itself. Move a vertex to untangle it.','边界自交或自触，请移动顶点使边界成为简单多边形。'],
 area:['This polygon has almost no area. Draw a wider shape.','多边形面积过小，请画得更宽一些。'],
 thin:['This shape produces an extremely thin triangle. Move a corner or simplify the outline.','这个轮廓产生了过于狭长的三角形；请移动顶点或简化轮廓。'],
 triangulation:['This outline could not be triangulated. Simplify it and try again.','这个轮廓未能生成三角网格，请简化后重试。'],
 resolution:['There are too few interior nodes. Try the refined mesh.','内部节点太少，请使用精细网格。'],
 matrix:['The numerical mesh is unsuitable. Please change the outline.','网格不适合计算，请调整轮廓。'],
 rank:['The mode iteration lost independence. Please change the outline.','模式迭代未能保持独立，请调整轮廓后重试。'],
 'linear-solve':['The inner solve did not converge. Try a less thin polygon.','内部求解没有收敛，请尝试较宽、较规则的多边形。'],
 convergence:['The six modes did not all converge. Try the quick mesh or a simpler shape.','六个模式未全部收敛，请尝试快速网格或更简单的形状。'],
 timeout:['This calculation took too long. Try the quick mesh or a simpler shape.','计算耗时过长，请尝试快速网格或更简单的形状。'],
 worker:['The calculation could not start in this browser. Try a current browser or the static edition.','浏览器未能启动计算，请尝试较新浏览器或阅读静态版。']
};
function status(kind,code=''){statusKind=kind;errorCode=code;renderStatus()}
function renderStatus(){
 const node=$('status');node.classList.toggle('is-error',statusKind==='error');
 if(statusKind==='error'){const e=errors[errorCode]||errors.worker;node.textContent=e[lang==='zh'?1:0];return}
 const messages={
  ready:text('Edit the outline, then compute its six low modes.','修改轮廓后，计算前六个低阶模式。'),
  drawing:text('Place the corners in order, then close the polygon.','依次放置顶点，然后闭合多边形。'),
  computing:text('Computing six low modes locally in your browser…','正在你的浏览器中计算六个低阶模式……'),
  cancelled:text('Calculation cancelled. You can edit the outline or try again.','计算已取消，可以修改轮廓或重新计算。'),
  done:result?text(`Six estimates ready · ${result.triangles.length.toLocaleString()} triangles. Select a mode below.`,`已得到六个近似值 · ${result.triangles.length.toLocaleString()} 个三角形。可选择不同振型。`):''
 };node.textContent=messages[statusKind]||messages.ready;
}
function save(){history.push({polygon:clone(polygon),closed,preset});if(history.length>30)history.shift()}
function controls(){
 root.querySelectorAll('[data-forward-edit]').forEach(e=>e.disabled=busy);
 $('undo').disabled=busy||!history.length;$('close').disabled=busy||closed||polygon.length<3;
 $('compute').disabled=busy||!closed||polygon.length<3;
 $('cancel').hidden=!busy;$('play').disabled=!result;$('mode-select').disabled=!result;
 root.querySelectorAll('[data-forward-preset]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.forwardPreset===preset?'true':'false'));
}
function stop(){playing=false;cancelAnimationFrame(raf);lastTime=0;renderPlay()}
function renderPlay(){$('play').textContent=playing?text('Pause this mode','暂停这个模式'):text('Play this mode','播放这个模式');$('play').setAttribute('aria-pressed',String(playing))}
function invalidate(){stop();result=null;raster=null;comparison=null;phase=0;renderResults();draw();status(closed?'ready':'drawing')}
function renderEditor(){
 let s=`<title id="fwd-editor-title">${text('Polygon boundary editor; coordinates in model units','多边形边界编辑器，坐标为模型单位')}</title><rect x="30" y="30" width="400" height="300" fill="#fffdf7"/>`;
 for(let x=0;x<=4;x++)s+=`<path d="M${30+100*x} 30V330" stroke="#d8dfd2"/><text x="${30+100*x}" y="350" text-anchor="middle" font-size="10" fill="#607568">${x}</text>`;
 for(let y=0;y<=3;y++)s+=`<path d="M30 ${330-100*y}H430" stroke="#d8dfd2"/><text x="18" y="${334-100*y}" text-anchor="middle" font-size="10" fill="#607568">${y}</text>`;
 if(polygon.length){const points=polygon.map(p=>point(p).join(',')).join(' ');s+=`<${closed?'polygon':'polyline'} points="${points}" fill="${closed?'#dce8dc':'none'}" stroke="#167b79" stroke-width="2" stroke-linejoin="round"/>`}
 polygon.forEach((p,i)=>{const [x,y]=point(p);s+=`<g class="fwd-vertex" data-vertex="${i}"><circle cx="${x}" cy="${y}" r="15" fill="transparent"/><circle cx="${x}" cy="${y}" r="${!closed&&i===0?6:4.5}" fill="#167b79" stroke="#fffdf7" stroke-width="2"/><text x="${x+10}" y="${y-9}" font-size="10" fill="#203d3b">${i+1}</text></g>`});
 editor.innerHTML=s;$('vertex-count').textContent=polygon.length;
 let area='—',perimeter='—';if(closed&&polygon.length>=3){try{const p=M.cleanPolygon(polygon);area=Math.abs(M.signedArea(p)).toFixed(3);perimeter=p.reduce((s,a,i)=>s+M.distance(a,p[(i+1)%p.length]),0).toFixed(3)}catch(e){}}
 $('area').textContent=area;$('perimeter').textContent=perimeter;controls();
}
function renderFields(){
 $('vertex-fields').innerHTML=polygon.map((p,i)=>`<div class="forward-vertex-row"><span>${i+1}</span><label>x <input type="number" min="0.05" max="3.95" step="0.01" value="${p[0].toFixed(2)}" data-coordinate="${i},0" data-forward-edit aria-label="${text('Vertex','顶点')} ${i+1}, x"></label><label>y <input type="number" min="0.05" max="2.95" step="0.01" value="${p[1].toFixed(2)}" data-coordinate="${i},1" data-forward-edit aria-label="${text('Vertex','顶点')} ${i+1}, y"></label><button type="button" data-remove="${i}" data-forward-edit aria-label="${text('Remove vertex','删除顶点')} ${i+1}">${text('Remove','删除')}</button></div>`).join('');controls();
}
function update(){renderEditor();renderFields()}
function validate(){if(!closed)return;try{M.cleanPolygon(polygon)}catch(e){status('error',e.code)}}
function closePolygon(){if(busy||closed||polygon.length<3)return;save();closed=true;preset='';invalidate();update();validate()}
function addVertex(p){if(busy)return;if(polygon.length>=16){status('error','too-many');return}save();closed=false;preset='';polygon.push(p);invalidate();update()}
function cursor(e){const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(editor.getScreenCTM().inverse());return [Math.max(.05,Math.min(3.95,(p.x-30)/100)),Math.max(.05,Math.min(2.95,(330-p.y)/100))]}
editor.addEventListener('pointerdown',e=>{
 if(busy||e.button!==0)return;const p=cursor(e),hit=e.target.closest('[data-vertex]');
 if(!closed){if(hit&&Number(hit.dataset.vertex)===0&&polygon.length>=3)closePolygon();else addVertex(p);return}
 if(hit){save();drag={index:Number(hit.dataset.vertex),id:e.pointerId};editor.setPointerCapture(e.pointerId);editor.classList.add('is-dragging');preset='';invalidate();e.preventDefault()}
});
editor.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;polygon[drag.index]=cursor(e);renderEditor()});
function endDrag(e){if(!drag||e.pointerId!==drag.id)return;drag=null;editor.classList.remove('is-dragging');renderFields();validate()}
editor.addEventListener('pointerup',endDrag);editor.addEventListener('pointercancel',endDrag);
$('new').addEventListener('click',()=>{save();polygon=[];closed=false;preset='';invalidate();update()});
$('undo').addEventListener('click',()=>{const before=history.pop();if(!before)return;polygon=before.polygon;closed=before.closed;preset=before.preset;invalidate();update();validate()});
$('close').addEventListener('click',closePolygon);
$('add-point').addEventListener('click',()=>{
 const x=$('add-x'),y=$('add-y');if(!x.reportValidity()||!y.reportValidity())return;
 if(x.value===''||y.value===''){status('error','vertices');return}addVertex([Number(x.value),Number(y.value)]);
});
$('vertex-fields').addEventListener('change',e=>{
 if(!e.target.matches('[data-coordinate]')||busy)return;
 const [i,k]=e.target.dataset.coordinate.split(',').map(Number),v=Number(e.target.value),max=k===0?3.95:2.95;
 if(e.target.value===''||!Number.isFinite(v)||v<.05||v>max){e.target.value=polygon[i][k].toFixed(2);return}
 save();polygon[i][k]=v;preset='';invalidate();renderEditor();validate();
});
$('vertex-fields').addEventListener('click',e=>{const b=e.target.closest('[data-remove]');if(!b||busy)return;save();polygon.splice(Number(b.dataset.remove),1);if(polygon.length<3)closed=false;preset='';invalidate();update();validate()});
root.querySelectorAll('[data-forward-preset]').forEach(b=>b.addEventListener('click',()=>{save();preset=b.dataset.forwardPreset;polygon=clone(M.presets[preset]);closed=true;invalidate();update()}));
$('quality').addEventListener('change',invalidate);
function finishWorker(){clearTimeout(timeout);if(worker)worker.terminate();worker=null;busy=false;controls()}
function compute(){
 if(busy||!closed)return;try{M.cleanPolygon(polygon)}catch(e){status('error',e.code);return}
 invalidate();busy=true;controls();status('computing');const id=++requestId;
 try{
  worker=new Worker(workerURL);
  worker.onmessage=e=>{
   if(e.data.requestId!==id)return;
   if(e.data.type==='progress')return;
   if(e.data.type==='error'){finishWorker();status('error',e.data.code);return}
   if(e.data.type==='result'){
    finishWorker();result=e.data.result;selected=0;phase=0;
    const signature=JSON.stringify(polygon),quality=$('quality').value;
    comparison=lastSolved&&lastSolved.signature===signature&&lastSolved.quality!==quality?(result.eigenvalues[0]/lastSolved.lambda-1)*100:null;
    lastSolved={signature,quality,lambda:result.eigenvalues[0]};prepareField();renderResults();draw();status('done');controls();
   }
  };
  worker.onerror=()=>{finishWorker();status('error','worker')};
  worker.postMessage({polygon:clone(polygon),quality:$('quality').value,requestId:id});
  timeout=setTimeout(()=>{++requestId;finishWorker();status('error','timeout')},30000);
 }catch(e){finishWorker();status('error','worker')}
}
$('compute').addEventListener('click',compute);
$('cancel').addEventListener('click',()=>{++requestId;finishWorker();status('cancelled')});
function rectangleLambda(p){
 if(p.length!==4)return null;
 const edges=p.map((a,i)=>[p[(i+1)%4][0]-a[0],p[(i+1)%4][1]-a[1]]),length=edges.map(a=>Math.hypot(...a));
 if(edges.some((a,i)=>Math.abs(a[0]*edges[(i+1)%4][0]+a[1]*edges[(i+1)%4][1])>1e-7*length[i]*length[(i+1)%4]))return null;
 return Math.PI**2*(1/length[0]**2+1/length[1]**2);
}
function renderResults(){
 const body=$('spectrum-body');
 $('mode-select').setAttribute('aria-label',text('Select a calculated mode','选择已计算的振型'));
 $('mode-select').innerHTML=result?result.eigenvalues.map((_,i)=>`<option value="${i}" ${i===selected?'selected':''}>${text('Mode','模式')} ${i+1}</option>`).join(''):`<option>${text('No result','等待计算')}</option>`;
 if(!result){body.innerHTML=`<tr><td colspan="3">${text('Compute a shape to see its low spectrum.','计算一个形状后，在这里查看低阶谱。')}</td></tr>`;$('benchmark').hidden=true;$('numerical-details').textContent='';$('mode-label').textContent=text('NO RESULT','等待计算');$('mode-description').textContent=text('No calculated eigenfunction is currently displayed.','当前没有已计算的特征函数。');controls();return}
 body.innerHTML=result.eigenvalues.map((v,i)=>`<tr class="${i===selected?'is-selected':''}"><td><button type="button" data-forward-mode="${i}" aria-pressed="${i===selected}">${text('Mode','模式')} ${i+1}</button></td><td>${v.toFixed(3)}</td><td>${Math.sqrt(v/result.eigenvalues[0]).toFixed(3)}</td></tr>`).join('');
 $('mode-label').textContent=text('MODE ','模式 ')+(selected+1);
 $('mode-description').textContent=text(`Approximate mode ${selected+1}. Eigenvalue ${result.eigenvalues[selected].toFixed(3)}; relative frequency ${Math.sqrt(result.eigenvalues[selected]/result.eigenvalues[0]).toFixed(3)}. Teal and rust are opposite displacements; the dark interior curves are approximate nodal lines.`,`近似振型 ${selected+1}。特征值 ${result.eigenvalues[selected].toFixed(3)}，相对频率 ${Math.sqrt(result.eigenvalues[selected]/result.eigenvalues[0]).toFixed(3)}。青绿与赭色表示相反位移；内部深色曲线是近似节线。`);
 $('numerical-details').textContent=text(`${result.triangles.length.toLocaleString()} triangles · ${result.freeNodes.toLocaleString()} interior unknowns · maximum relative algebraic residual ${Math.max(...result.residuals).toExponential(1)}.`,`本次网格：${result.triangles.length.toLocaleString()} 个三角形、${result.freeNodes.toLocaleString()} 个内部未知量；最大相对代数残差 ${Math.max(...result.residuals).toExponential(1)}。`);
 const exact=rectangleLambda(result.polygon),lines=[];
 if(exact){const error=Math.abs(result.eigenvalues[0]/exact-1)*100;lines.push(text(`Rectangle check: exact λ₁ = ${exact.toFixed(3)}; this mesh differs by ${error.toFixed(2)}%.`,`矩形校验：解析值 λ₁ = ${exact.toFixed(3)}；本次网格的近似值与它相差 ${error.toFixed(2)}%。`))}
 if(comparison!==null)lines.push(text(`Changing mesh resolution changed λ₁ by ${Math.abs(comparison).toFixed(2)}%. This is a comparison, not an error bound.`,`切换网格精度后，λ₁ 变化了 ${Math.abs(comparison).toFixed(2)}%。这是两次近似值的比较，不是误差上界。`));
 $('benchmark').textContent=lines.join(' ');$('benchmark').hidden=!lines.length;controls();
}
function selectMode(index){if(!result)return;stop();selected=index;phase=0;prepareField();renderResults();draw()}
$('mode-select').addEventListener('change',e=>selectMode(Number(e.target.value)));
$('spectrum-body').addEventListener('click',e=>{const b=e.target.closest('[data-forward-mode]');if(!b||!result)return;selectMode(Number(b.dataset.forwardMode));canvas.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})});
function pathFromPolygon(p){const path=new Path2D();p.forEach((v,i)=>{const [x,y]=point(v);if(i)path.lineTo(x,y);else path.moveTo(x,y)});path.closePath();return path}
function prepareField(){
 raster=new Float32Array(460*360).fill(NaN);active=[];meshPath=new Path2D();nodePath=new Path2D();boundaryPath=pathFromPolygon(result.polygon);
 const raw=result.modes[selected],maximum=raw.reduce((a,v)=>Math.max(a,Math.abs(v)),0),values=Float64Array.from(raw,v=>v/maximum);
 for(const t of result.triangles){
  const p=t.map(i=>point(result.nodes[i])),v=t.map(i=>values[i]);
  meshPath.moveTo(...p[0]);meshPath.lineTo(...p[1]);meshPath.lineTo(...p[2]);meshPath.closePath();
  const [a,b,c]=p,den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);
  const x0=Math.max(0,Math.floor(Math.min(...p.map(q=>q[0])))),x1=Math.min(459,Math.ceil(Math.max(...p.map(q=>q[0]))));
  const y0=Math.max(0,Math.floor(Math.min(...p.map(q=>q[1])))),y1=Math.min(359,Math.ceil(Math.max(...p.map(q=>q[1]))));
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
   const u=((b[1]-c[1])*(x+.5-c[0])+(c[0]-b[0])*(y+.5-c[1]))/den,w=((c[1]-a[1])*(x+.5-c[0])+(a[0]-c[0])*(y+.5-c[1]))/den,z=1-u-w;
   if(u>=-1e-7&&w>=-1e-7&&z>=-1e-7)raster[y*460+x]=u*v[0]+w*v[1]+z*v[2];
  }
  const hits=[];
  for(let j=0;j<3;j++){
   const k=(j+1)%3;if(v[j]===0&&v[k]===0)continue;
   if(v[j]*v[k]<=0){const f=v[j]/(v[j]-v[k]),hit=[p[j][0]+f*(p[k][0]-p[j][0]),p[j][1]+f*(p[k][1]-p[j][1])];if(!hits.some(q=>Math.hypot(q[0]-hit[0],q[1]-hit[1])<1e-5))hits.push(hit)}
  }
  if(hits.length===2){nodePath.moveTo(...hits[0]);nodePath.lineTo(...hits[1])}
 }
 for(let i=0;i<raster.length;i++)if(Number.isFinite(raster[i]))active.push(i);
 image.data.fill(0);
}
function draw(){
 ctx.setTransform(2,0,0,2,0,0);ctx.clearRect(0,0,460,360);ctx.fillStyle='#f8f7ef';ctx.fillRect(30,30,400,300);
 ctx.strokeStyle='#dce1d4';ctx.lineWidth=.7;ctx.beginPath();for(let x=0;x<=4;x++){ctx.moveTo(30+x*100,30);ctx.lineTo(30+x*100,330)}for(let y=0;y<=3;y++){ctx.moveTo(30,330-y*100);ctx.lineTo(430,330-y*100)}ctx.stroke();
 ctx.font='10px Arial';ctx.fillStyle='#607568';ctx.textAlign='center';for(let x=0;x<=4;x++)ctx.fillText(x,30+x*100,350);for(let y=0;y<=3;y++)ctx.fillText(y,18,334-y*100);
 if(!result||!raster){ctx.fillStyle='#607568';ctx.font='13px Arial';ctx.fillText(text('Your calculated mode will appear here.','计算后的振型将显示在这里。'),230,182);return}
 const factor=Math.cos(phase),paper=[247,245,236],pos=[40,132,121],neg=[179,103,70],pixels=image.data;
 for(const i of active){const v=raster[i]*factor,to=v>=0?pos:neg,a=Math.pow(Math.abs(v),.72),j=i*4;for(let k=0;k<3;k++)pixels[j+k]=paper[k]+a*(to[k]-paper[k]);pixels[j+3]=255}
 offctx.putImageData(image,0,0);ctx.drawImage(off,0,0);
 if($('show-mesh').checked){ctx.strokeStyle='rgba(35,70,56,.22)';ctx.lineWidth=.5;ctx.stroke(meshPath)}
 ctx.strokeStyle='#294d45';ctx.lineWidth=.85;ctx.stroke(nodePath);ctx.strokeStyle='#203d3b';ctx.lineWidth=1.8;ctx.stroke(boundaryPath);
}
function frame(now){
 if(!playing||!result)return;
 if(lastTime&&now-lastTime<30){raf=requestAnimationFrame(frame);return}
 if(lastTime)phase+=(Math.min(now-lastTime,100)/2400)*2*Math.PI*Math.sqrt(result.eigenvalues[selected]/result.eigenvalues[0]);lastTime=now;draw();raf=requestAnimationFrame(frame);
}
$('play').addEventListener('click',()=>{if(!result)return;if(playing)stop();else{playing=true;lastTime=0;renderPlay();raf=requestAnimationFrame(frame)}});
$('show-mesh').addEventListener('change',draw);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
if('IntersectionObserver' in window)new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)stop()}).observe(canvas);
$('language').addEventListener('click',()=>{
 lang=lang==='en'?'zh':'en';root.lang=lang==='zh'?'zh-Hans':'en';
 root.querySelectorAll('[data-forward-en]').forEach(e=>e.textContent=e.dataset[lang==='zh'?'forwardZh':'forwardEn']);
 $('language').textContent=lang==='zh'?'English':'中文说明';$('language').lang=lang==='zh'?'en':'zh-Hans';
 update();renderResults();renderStatus();renderPlay();draw();
});
update();renderResults();draw();compute();
})();
