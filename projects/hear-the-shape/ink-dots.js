(() => {
  'use strict';
  const section = document.getElementById('ink-dots');
  const mesh = section.querySelector('#ink-mesh');
  const phase = section.querySelector('#ink-phase');
  const button = section.querySelector('#ink-play');
  const sound = section.querySelector('#ink-sound');
  const centre = section.querySelector('#ink-centre');
  const sideCentre = section.querySelector('#ink-side-centre');
  const slice = section.querySelector('#ink-slice');
  const profile = section.querySelector('#ink-profile');
  const height = section.querySelector('#ink-height');
  const eigenvalue = DrumMath.eigenvalue(1);
  const speed = window.DrumAudio?.visualFrequency(eigenvalue) || 0.42;
  const channel = window.DrumAudio?.channel('ink-dots', {onInterrupt: pause});
  let frame = null;
  let fraction = Number(phase.value) / 100;
  let previousTime;
  // Each sample stores its rest position and the fixed height of the first mode.
  function sectionLine(alongX, fixed) {
    return Array.from({length: 33}, (_, i) => {
      const x = alongX ? i / 32 : fixed;
      const y = alongX ? fixed : i / 32;
      const shape = x === 0 || x === 1 || y === 0 || y === 1 ? 0 : DrumMath.shape(2*x,y,1);
      return [32 + 338*x + 58*y, 146 - 66*y, shape];
    });
  }
  function pathAt(points, amplitude) {
    return points.map(([x,y,z],i) => (i ? 'L' : 'M') + x.toFixed(1) + ' ' + (y-amplitude*z).toFixed(1)).join('');
  }
  const meshLines = [];
  for (const alongX of [true,false]) {
    for (let i = 1; i < 12; i++) {
      const path = document.createElementNS('http://www.w3.org/2000/svg','path');
      mesh.appendChild(path);
      meshLines.push([path,sectionLine(alongX,i/12)]);
    }
  }
  const middle = sectionLine(true,0.5);
  const side = middle.map(([x,,z]) => [x,245,z]);
  function render() {
    const value = Math.sin(2*Math.PI*fraction);
    for (const [path,points] of meshLines) path.setAttribute('d',pathAt(points,68*value));
    slice.setAttribute('d',pathAt(middle,68*value));
    profile.setAttribute('d',pathAt(side,34*value));
    centre.setAttribute('transform','translate(230 '+(113-68*value)+')');
    sideCentre.setAttribute('transform','translate(230 '+(245-34*value)+')');
    const reading = Math.abs(value)<0.005 ? '0.00' : (value>0 ? '+' : '−')+Math.abs(value).toFixed(2);
    if(height.textContent!==reading) height.textContent=reading;
    phase.value = Math.round(fraction*100);
    phase.setAttribute('aria-valuetext',phase.value+'% of cycle. Rim zero, centre '+reading);
  }
  function pause() {
    if(frame!==null) cancelAnimationFrame(frame);
    frame=null;
    previousTime=undefined;
    button.textContent='Play vibration';
    channel?.stop();
  }
  function tick(time) {
    if(previousTime!==undefined) fraction=(fraction+(time-previousTime)*speed/1000)%1;
    previousTime=time;
    render();
    frame=requestAnimationFrame(tick);
  }
  button.addEventListener('click',() => {
    if(frame!==null) { pause(); return; }
    button.textContent='Pause vibration';
    channel?.setEnabled(sound.checked);
    channel?.play(eigenvalue);
    frame=requestAnimationFrame(tick);
  });
  phase.addEventListener('input',() => {pause(); fraction=Number(phase.value)/100; render();});
  sound.addEventListener('change',() => channel?.setEnabled(sound.checked));
  document.addEventListener('visibilitychange',() => {if(document.hidden) pause();});
  window.addEventListener('pagehide',pause);
  if('IntersectionObserver' in window) new IntersectionObserver(entries => {
    if(!entries[0].isIntersecting && frame!==null) pause();
  }).observe(section);
  render();
  section.querySelector('.ink-controls').hidden=false;
})();
