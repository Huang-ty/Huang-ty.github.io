(() => {
  const section = document.getElementById('perimeter-lab');
  const time = section.querySelector('select');
  // The rectangular Dirichlet heat sum factors into two one-dimensional sums.
  function axisTrace(length, tau) {
    const rate = tau * (Math.PI / length) ** 2;
    const last = Math.ceil(Math.sqrt(40 / rate));
    let total = 0;
    for (let i = 1; i <= last; i++) total += Math.exp(-rate * i * i);
    return total;
  }
  function update() {
    const tau = Number(time.value);
    const baseline = 4 / (4 * Math.PI * tau);
    const scale = 8 * Math.sqrt(Math.PI * tau);
    section.querySelector('[data-baseline]').textContent = baseline.toFixed(2);
    for (const row of section.querySelectorAll('[data-sides]')) {
      const [a,b] = row.dataset.sides.split(',').map(Number);
      const trace = axisTrace(a,tau) * axisTrace(b,tau);
      row.querySelector('[data-trace]').textContent = trace.toFixed(2);
      row.querySelector('[data-loss]').textContent = (baseline - trace).toFixed(2);
      row.querySelector('[data-length]').textContent = (scale * (baseline - trace)).toFixed(2);
    }
  }
  time.addEventListener('change',update);
  function openLinkedExperiment() {
    if (location.hash === '#perimeter-lab') section.open = true;
  }
  window.addEventListener('hashchange', openLinkedExperiment);
  openLinkedExperiment();
  update();
})();
