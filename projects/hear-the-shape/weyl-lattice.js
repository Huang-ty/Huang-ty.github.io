(() => {
  'use strict';
  const panel = document.getElementById('area-exploration');
  const selector = document.getElementById('weyl-row');
  const fixed = document.getElementById('weyl-fixed');
  const ns = 'http://www.w3.org/2000/svg';
  const shapes = [{id:'long',a:4,b:1}, {id:'square',a:2,b:2}];
  let cutoff = 80;

  function element(parent, name, attrs, text) {
    const node = document.createElementNS(ns,name);
    for (const [key,value] of Object.entries(attrs)) node.setAttribute(key,value);
    if (text !== undefined) node.textContent = text;
    parent.appendChild(node);
    return node;
  }
  // The left outline uses physical side lengths; the right sketch uses mode indices.
  function drawGuide({id,a,b}) {
    const svg = document.querySelector('#weyl-'+id+' .weyl-guide');
    const label = a+' × '+b;
    svg.setAttribute('aria-label',label+' drum outline and full cutoff ellipse, with its positive quadrant highlighted.');
    const cx=246, cy=38, rx=12*a, ry=12*b;
    element(svg,'rect',{x:78-9*a,y:cy-9*b,width:18*a,height:18*b,class:'weyl-box'});
    element(svg,'text',{x:78,y:80,'text-anchor':'middle'},label+' drumhead');
    element(svg,'path',{d:'M141 38h22m-5 -4 5 4 -5 4',fill:'none',stroke:'#6b8177'});
    element(svg,'ellipse',{cx,cy,rx,ry,fill:'#eef1e9',stroke:'#84988b'});
    element(svg,'path',{d:'M'+cx+' '+cy+'h'+rx+'a'+rx+' '+ry+' 0 0 0 '+(-rx)+' '+(-ry)+'Z',fill:'#9dc6a7',stroke:'#386b54'});
    element(svg,'path',{d:'M'+(cx-rx-6)+' '+cy+'h'+(2*rx+12)+' M'+cx+' '+(cy+ry+5)+'v'+(-2*ry-10),fill:'none',stroke:'#6d8176'});
    element(svg,'rect',{x:cx,y:cy-ry,width:rx,height:ry,class:'weyl-box'});
    element(svg,'text',{x:cx,y:80,'text-anchor':'middle'},'Count this quarter');
  }
  shapes.forEach(drawGuide);
  function plot({id,a,b}, rows, previous) {
    const card = document.getElementById('weyl-'+id);
    const svg = card.querySelector('.weyl-plot');
    const layer = document.createDocumentFragment();
    const N = rows.reduce((sum,k)=>sum+k,0);
    const row = Number(selector.value);
    const view = fixed.checked ? 8000 : cutoff;
    const scale = Math.min(280/Math.ceil(4*Math.sqrt(view)/Math.PI),138/Math.ceil(2*Math.sqrt(view)/Math.PI));
    const x = m => 33+m*scale, y = n => 169-n*scale;
    const width = 303, height = 146;
    function arc(limit) {
      const r = Math.sqrt(limit)/Math.PI;
      return 'M'+x(a*r)+' '+y(0)+' A'+a*r*scale+' '+b*r*scale+' 0 0 0 '+x(0)+' '+y(b*r);
    }
    const fmt = k => k.toLocaleString('en-US');
    element(layer,'title',{},a+' by '+b+' drum: '+fmt(N)+' modes with eigenvalue at most '+fmt(cutoff));
    element(layer,'path',{d:arc(cutoff)+' L'+x(0)+' '+y(0)+'Z',fill:'#efdfbd'});
    // Unit cells are attached to the upper-right corner (m,n). In each row
    // their union is one rectangle, so its area is exactly that row's count.
    rows.forEach((k,i) => {
      element(layer,'rect',{x:x(0),y:y(i+1),width:k*scale,height:scale,fill:row===i+1?'#85b7a2':'#b8d6bd'});
    });
    if (scale >= 9) {
      let grid='';
      rows.forEach((k,i) => {
        grid+='M'+x(0)+' '+y(i+1)+'H'+x(k);
        for(let m=1;m<=k;m++) grid+='M'+x(m)+' '+y(i)+'V'+y(i+1);
      });
      element(layer,'path',{d:grid,fill:'none',stroke:'#739b83','stroke-width':0.55});
    }
    let marks='';
    const radius=Math.min(3.5,scale*.29);
    // Render dots in one path. Each subpath still represents one integer pair.
    rows.forEach((k,i) => {
      for(let m=1;m<=k;m++) marks+='M'+(x(m)-radius).toFixed(2)+' '+y(i+1).toFixed(2)+'a'+radius+' '+radius+' 0 1 0 '+2*radius+' 0a'+radius+' '+radius+' 0 1 0 '+(-2*radius)+' 0Z';
    });
    element(layer,'path',{d:marks,fill:'#17594d',class:'weyl-dots'});
    const firstMisses=[...rows,0];
    firstMisses.forEach((k,i) => {
      if(x(k+1)<=x(0)+width && y(i+1)>=y(0)-height)
        element(layer,'circle',{cx:x(k+1),cy:y(i+1),r:radius,fill:'none',stroke:'#9c593c','stroke-width':Math.min(1.4,radius*.75)});
    });
    element(layer,'path',{d:arc(cutoff),fill:'none',stroke:'#6d5531','stroke-width':1.6});
    if(previous) element(layer,'path',{d:arc(previous),fill:'none',stroke:'#805033','stroke-width':1.6,'stroke-dasharray':'4 3'});
    const step=view===80?2:view===800?5:20;
    element(layer,'path',{d:'M33 19V169H342',fill:'none',stroke:'#617a6b'});
    const r = Math.sqrt(cutoff)/Math.PI;
    const mIntercept=a*r, nIntercept=b*r;
    element(layer,'rect',{x:x(0),y:y(nIntercept),width:mIntercept*scale,height:nIntercept*scale,class:'weyl-box'});
    card.querySelector('.weyl-intercepts').textContent = 'Dashed box: '+mIntercept.toFixed(2)+' across × '+nIntercept.toFixed(2)+' up in mode-index units. Each drum length is scaled by √Λ/π.';
    element(layer,'text',{x:20,y:183},'0');
    for(let m=step;m*scale<=width-4;m+=step) {
      element(layer,'path',{d:'M'+x(m)+' 169v4',stroke:'#617a6b'});
      element(layer,'text',{x:x(m),y:188,'text-anchor':'middle'},m);
    }
    for(let n=step;n*scale<=height;n+=step) {
      element(layer,'path',{d:'M29 '+y(n)+'h4',stroke:'#617a6b'});
      element(layer,'text',{x:24,y:y(n)+4,'text-anchor':'end'},n);
    }
    element(layer,'text',{x:12,y:15},'n');
    element(layer,'text',{x:345,y:174},'m');
    if(row) {
      element(layer,'path',{d:'M33 '+y(row)+'H335',stroke:'#78441e','stroke-width':1.2,'stroke-dasharray':'2 3'});
    }
    svg.replaceChildren(layer);
    svg.setAttribute('aria-label',a+' by '+b+' drum: '+fmt(N)+' positive integer pairs inside or on the cutoff curve.');
    const caption = card.querySelector('.weyl-row');
    if(row) {
      const k=rows[row-1] || 0;
      const lam = m => (Math.PI**2*((m/a)**2+(row/b)**2)).toFixed(2);
      caption.textContent = k
        ? 'Row n = '+row+' has '+k+' modes. Last in: ('+k+', '+row+') at λ ≈ '+lam(k)+'. First out: ('+(k+1)+', '+row+') at λ ≈ '+lam(k+1)+'.'
        : 'Row n = '+row+' has no modes below this cutoff. Even (1, '+row+') has λ ≈ '+lam(1)+'.';
    } else if(cutoff===80) {
      caption.textContent='Count the dots from the bottom row up: '+rows.join(' + ')+' = '+N+'.';
    } else {
      caption.textContent=rows.length+' occupied rows sum to '+fmt(N)+' dots. The dashed curve marks the previous cutoff of '+fmt(previous)+'.';
    }
    const share=window.DrumMath.areaEstimate(a,b,cutoff)/4;
    card.querySelector('.weyl-track i').style.width=(share*100)+'%';
  }
  function redraw() {
    const prev=cutoff===8000?800:cutoff===800?80:0;
    document.getElementById('weyl-prior').hidden=!prev;
    const rows=shapes.map(({a,b})=>window.DrumMath.modeRowCounts(a,b,cutoff));
    const max=Math.max(...rows.map(r=>r.length));
    if(selector.options.length!==max+1) {
      const selected=selector.value;
      selector.replaceChildren(new Option('All rows','0'));
      for(let n=1;n<=max;n++)selector.add(new Option('n = '+n,n));
      selector.value=Number(selected)<=max?selected:'0';
    }
    shapes.forEach((shape,i)=>plot(shape,rows[i],prev));
  }
  function openLinked() {
    if(location.hash==='#area-exploration'||location.hash==='#weyl-lattice')panel.open=true;
  }
  selector.addEventListener('change',redraw);
  fixed.addEventListener('change',redraw);
  window.addEventListener('hashchange',openLinked);
  openLinked();
  window.DrumWeyl={draw(value){cutoff=value;redraw();}};
})();
