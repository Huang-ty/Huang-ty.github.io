(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const audio = window.DrumAudio;
  const squareSection = byId('square-modes');
  const squareLanguage = (en, zh) => squareSection.closest('[lang]').lang.startsWith('zh') ? zh : en;
  const eigenvalue = (a, b, m, n) => Math.PI ** 2 * ((m / a) ** 2 + (n / b) ** 2);
  const shapes = {
    square: eigenvalue(2, 2, 1, 1),
    rectangle: eigenvalue(4, 1, 1, 1)
  };
  const sharedValue = eigenvalue(2, 2, 2, 1);
  const hzToggle = byId('guess-hz');
  let hiddenShape;
  let activeButton = null;
  let endTimer;
  let animation;

  // Cache the two displacement maps at opposite extremes of their oscillation.
  function prepareMode(id, m, n) {
    const canvas = byId(id);
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const neutral = [245, 242, 234], positive = [30, 126, 118], negative = [172, 88, 60];
    const maps = [1, -1].map(sign => {
      const frame = document.createElement('canvas');
      frame.width = frame.height = size;
      const brush = frame.getContext('2d');
      const pixels = brush.createImageData(size, size);
      for (let row = 0; row < size; row++) {
        const y = 1 - row / (size - 1);
        for (let col = 0; col < size; col++) {
          const x = col / (size - 1);
          const height = sign * Math.sin(m * Math.PI * x) * Math.sin(n * Math.PI * y);
          const color = height > 0 ? positive : negative;
          const offset = 4 * (row * size + col);
          neutral.forEach((base, k) => { pixels.data[offset + k] = base + Math.abs(height) * (color[k] - base); });
          pixels.data[offset + 3] = 255;
        }
      }
      brush.putImageData(pixels, 0, 0);
      return frame;
    });
    return amplitude => {
      ctx.fillStyle = '#f5f2ea';
      ctx.fillRect(0, 0, size, size);
      ctx.globalAlpha = Math.abs(amplitude);
      ctx.drawImage(maps[amplitude >= 0 ? 0 : 1], 0, 0);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#253e39';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(m === 2 ? size / 2 : 0, m === 2 ? 0 : size / 2);
      ctx.lineTo(m === 2 ? size / 2 : size, m === 2 ? size : size / 2);
      ctx.stroke();
    };
  }
  const draw = { '21': prepareMode('square-21', 2, 1), '12': prepareMode('square-12', 1, 2) };
  Object.values(draw).forEach(render => render(1));

  function clearPlayback() {
    clearTimeout(endTimer);
    cancelAnimationFrame(animation);
    if (activeButton) {
      activeButton.setAttribute('aria-pressed', 'false');
      draw[activeButton.dataset.listen]?.(1);
    }
    activeButton = null;
  }
  const channel = audio.channel('listening-experiments', { onInterrupt: clearPlayback });
  function stop() { channel.stop(); clearPlayback(); }

  function start(button) {
    const repeated = button === activeButton;
    stop();
    if (repeated) return;
    const key = button.dataset.listen;
    const render = draw[key];
    const value = render ? sharedValue : shapes[key === 'hidden' ? hiddenShape : key];
    const status = byId(render ? 'square-audio' : 'guess-audio');
    if (!render && hzToggle.checked) {
      status.textContent = 'Silent play · ' + audio.pitch(value).toFixed(1) + ' Hz';
      return;
    }
    activeButton = button;
    button.setAttribute('aria-pressed', 'true');
    const duration = render ? 1000 / audio.visualFrequency(value) : 1500;
    if (render && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const startTime = performance.now();
      const frame = now => {
        render(Math.cos(2 * Math.PI * (now - startTime) / duration));
        animation = requestAnimationFrame(frame);
      };
      animation = requestAnimationFrame(frame);
    }
    status.textContent = '';
    channel.play(value).then(() => {
      if (activeButton !== button) return;
      const audible = channel.getState() === 'audible';
      if (render) {
        status.textContent = audible ? squareLanguage('Demo tone · 220 Hz', '演示音高 · 220 Hz') :
          squareLanguage('Audio unavailable. Both patterns have a demo pitch of 220 Hz.', '声音不可用。两个振型的演示音高都是 220 Hz。');
      } else {
        status.textContent = audible ? '' : 'Audio unavailable. Select “Show pitches in Hz” to compare the notes silently.';
      }
      endTimer = setTimeout(stop, duration);
    });
  }
  document.querySelectorAll('[data-listen]').forEach(button => {
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => start(button));
  });
  function showPitches() {
    document.querySelectorAll('[data-hz]').forEach(label => {
      const key = label.dataset.hz;
      label.hidden = !hzToggle.checked;
      label.textContent = audio.pitch(shapes[key === 'hidden' ? hiddenShape : key]).toFixed(1) + ' Hz';
    });
  }
  function newRound() {
    stop();
    hiddenShape = Math.random() < 0.5 ? 'square' : 'rectangle';
    byId('guess-reveal').hidden = true;
    byId('guess-feedback').textContent = '';
    byId('guess-audio').textContent = '';
    document.querySelectorAll('[data-guess]').forEach(button => { button.disabled = false; });
    showPitches();
  }
  document.querySelectorAll('[data-guess]').forEach(button => {
    button.addEventListener('click', () => {
      stop();
      const correct = button.dataset.guess === hiddenShape;
      byId('guess-feedback').textContent = (correct ? 'You heard it! ' : 'This time it was the other drum. ') +
        'The hidden ' + hiddenShape + ' has a fundamental of ' + audio.pitch(shapes[hiddenShape]).toFixed(1) + ' Hz on our demo scale.';
      byId('guess-reveal').hidden = false;
      document.querySelectorAll('[data-guess]').forEach(choice => { choice.disabled = true; });
    });
  });
  hzToggle.addEventListener('change', () => { stop(); byId('guess-audio').textContent = ''; showPitches(); });
  byId('guess-again').addEventListener('click', () => {
    newRound();
    document.querySelector('[data-listen="hidden"]').focus();
  });
  newRound();
})();
