(() => {
  'use strict';
  const sample = window.DrumTransplantSample;
  const rows = window.DrumMath.transplant;
  const byId = id => document.getElementById(id);
  const svgNS = 'http://www.w3.org/2000/svg';
  const sub = '₀₁₂₃₄₅₆';
  const examplePoints = [[0.56,0.28,0.16],[0.19,0.23,0.58],[0.14,0.72,0.14],[0.39,0.12,0.49]];
  let chosen = 0, weights = examplePoints[0], example = 0;
  const n = sample.divisions;
  const canvas = byId('point-map');
  const ctx = canvas.getContext('2d');
  let mapTriangle, background;

  function diagrams(side) {
    const triangles = [], dots = [];
    let svg;
    for (const polygon of document.querySelectorAll('.transfer-tile[data-side="'+side+'"]')) {
      svg = polygon.ownerSVGElement;
      const tile = Number(polygon.dataset.tile);
      // Reflections preserve vertex indices, even when the winding reverses.
      triangles[tile] = Array.from(polygon.points, p => [p.x,p.y]);
      const dot = document.createElementNS(svgNS,'circle');
      dot.setAttribute('r', side === 'source' ? '5' : '6.5');
      dot.setAttribute('class','probe-dot');
      dot.setAttribute('fill',side === 'source' ? '#fff' : '#ffc247');
      dot.setAttribute('aria-hidden','true');
      svg.append(dot);
      dots[tile] = dot;
    }
    return {triangles,dots,svg};
  }
  const source = diagrams('source'), target = diagrams('target');

  function position(vertices, w) {
    return [0,1].map(axis => vertices.reduce((sum,v,i) => sum + w[i]*v[axis],0));
  }
  function barycentric([x,y], [[ax,ay],[bx,by],[cx,cy]]) {
    const det = (bx-ax)*(cy-ay)-(by-ay)*(cx-ax);
    const b = ((x-ax)*(cy-ay)-(y-ay)*(cx-ax))/det;
    const c = ((bx-ax)*(y-ay)-(by-ay)*(x-ax))/det;
    return [1-b-c,b,c];
  }
  function inside(w) { return w.every(v => v >= -1e-8); }
  // Piecewise linear interpolation on the same triangular grid used for the solve.
  function height(tile, w) {
    const x = Math.max(0,w[1])*n, y = Math.max(0,w[2])*n;
    const i = Math.floor(x), j = Math.floor(y), u = x-i, v = y-j;
    const at = (a,b) => sample.tiles[tile][a*(n+1)-a*(a-1)/2+b];
    if (i+j >= n) return at(i,j);
    if (u+v <= 1 || i+j === n-1) return (1-u-v)*at(i,j) + u*at(i+1,j) + v*at(i,j+1);
    return (u+v-1)*at(i+1,j+1) + (1-v)*at(i+1,j) + (1-u)*at(i,j+1);
  }
  function contributions(w) {
    return rows[chosen].flatMap((sign,tile) => sign ? [{tile,sign,value:height(tile,w)}] : []);
  }
  function sum(terms) { return terms.reduce((total,t) => total+t.sign*t.value,0); }
  function number(x) { return (Math.abs(x)<0.0005 ? 0 : x).toFixed(3).replace('-','−'); }
  function expression(terms, label) {
    return terms.map((t,i) => (t.sign<0 ? ' − ' : i ? ' + ' : '')+label(t)).join('').trim();
  }
  function buildMap() {
    const vertices = target.triangles[chosen];
    const xs = vertices.map(v=>v[0]), ys = vertices.map(v=>v[1]);
    const midX = (Math.max(...xs)+Math.min(...xs))/2, midY = (Math.max(...ys)+Math.min(...ys))/2;
    const size = canvas.width;
    const scale = (size-16)/Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys));
    mapTriangle = vertices.map(([x,y])=>[size/2+(x-midX)*scale,size/2+(y-midY)*scale]);
    background = ctx.createImageData(size,size);
    const neutral = [237,236,221];
    const nodeValues = sample.tiles[0].map((_,i)=>rows[chosen].reduce((s,sign,t)=>s+sign*sample.tiles[t][i],0));
    const maxHeight = Math.max(...nodeValues.map(Math.abs));
    for(let y=0;y<size;y++) for(let x=0;x<size;x++) {
      const w = barycentric([x+.5,y+.5],mapTriangle);
      if(!inside(w)) continue;
      const h = sum(contributions(w)), end = h>=0 ? [18,110,101] : [161,71,42];
      const strength = maxHeight ? Math.min(1,Math.abs(h)/maxHeight) : 0;
      const offset = 4*(y*size+x);
      for(let c=0;c<3;c++) background.data[offset+c] = neutral[c]+strength*(end[c]-neutral[c]);
      background.data[offset+3] = 255;
    }
  }
  function mark(diagram,tile,show) {
    const dot = diagram.dots[tile];
    dot.style.display = show ? '' : 'none';
    if (!show) return;
    const [x,y] = position(diagram.triangles[tile],weights);
    dot.setAttribute('cx',x); dot.setAttribute('cy',y);
  }
  function render(announce = false) {
    const terms = contributions(weights);
    const rule = 'g'+sub[chosen]+'(P) = '+expression(terms,t=>'f'+sub[t.tile]+'(P'+sub[t.tile]+')');
    const numeric = expression(terms,t=>number(t.value).startsWith('−')?'('+number(t.value)+')':number(t.value))
      +' ≈ '+number(sum(terms));
    byId('probe-rule').textContent = rule;
    byId('probe-sum').textContent = numeric;
    byId('point-map-caption').textContent = 'Tile '+chosen+' · displacement';
    byId('probe-edge-note').hidden = !(chosen===4 && Math.abs(weights[2])<1e-8);
    for(let tile=0;tile<7;tile++) {
      mark(source,tile,rows[chosen][tile]!==0); mark(target,tile,tile===chosen);
    }
    ctx.putImageData(background,0,0);
    ctx.strokeStyle='#45584c'; ctx.lineWidth=1.2;
    ctx.beginPath(); mapTriangle.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y)); ctx.closePath(); ctx.stroke();
    const [x,y] = position(mapTriangle,weights);
    ctx.beginPath(); ctx.arc(x,y,5,0,2*Math.PI); ctx.fillStyle='#ffc247'; ctx.fill(); ctx.stroke();
    if(announce) byId('probe-announce').textContent = rule+'. '+numeric;
  }
  function select(k) {
    chosen=k; buildMap(); render();
  }
  function locate(point, announce) {
    // Prefer the current tile at a seam, where both valid sums have the same value.
    for(const k of [chosen,...rows.keys()]) {
      const w = barycentric(point,target.triangles[k]);
      if(!inside(w)) continue;
      weights=w;
      if(k!==chosen) document.querySelector('[data-target="'+k+'"]').click();
      render(announce); return true;
    }
    return false;
  }
  function pointFromEvent(svg,event) {
    return new DOMPoint(event.clientX,event.clientY).matrixTransform(svg.getScreenCTM().inverse());
  }
  function dragOn(element, move) {
    let pointer = null;
    element.addEventListener('pointerdown',event=>{
      if(pointer!==null || event.button!==0 || !move(event,true)) return;
      pointer=event.pointerId;
      element.setPointerCapture(pointer);
    });
    element.addEventListener('pointermove',event=>{if(pointer===event.pointerId) move(event,false);});
    element.addEventListener('lostpointercapture',()=>{pointer=null;});
    element.addEventListener('pointerup',event=>{if(pointer===event.pointerId) render(true);});
  }
  target.svg.classList.add('probe-target');
  target.svg.setAttribute('tabindex','0');
  target.svg.setAttribute('aria-describedby','probe-keyboard');
  dragOn(target.svg,(event,announce)=>{
    const p = pointFromEvent(target.svg,event);
    return locate([p.x,p.y],announce);
  });
  dragOn(canvas,(event,announce)=>{
    const r=canvas.getBoundingClientRect();
    const w=barycentric([(event.clientX-r.left)*canvas.width/r.width,(event.clientY-r.top)*canvas.height/r.height],mapTriangle);
    if(!inside(w)) return false;
    weights=w; render(announce); return true;
  });
  const directions = {ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
  target.svg.addEventListener('keydown',event=>{
    const delta = directions[event.key];
    if(!delta) return;
    event.preventDefault();
    const point=position(target.triangles[chosen],weights), step=event.shiftKey?1:4;
    locate(point.map((v,i)=>v+step*delta[i]),true);
  });
  byId('probe-next').addEventListener('click',()=>{
    example=(example+1)%examplePoints.length; weights=examplePoints[example]; render(true);
  });
  byId('probe-edge').addEventListener('click',()=>{
    weights=[0.46,0.54,0]; document.querySelector('[data-target="4"]').click(); render(true);
  });
  const details = byId('transfer-exploration');
  function openLinkedProbe() {
    if (location.hash==='#point-transplant') {
      details.open=true; byId('point-transplant').scrollIntoView();
    }
  }
  window.addEventListener('hashchange', openLinkedProbe);
  window.DrumPointProbe={select};
  byId('probe-readout').hidden=false;
  openLinkedProbe();
})();
