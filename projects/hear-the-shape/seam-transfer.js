(() => {
  'use strict';

  const root = document.getElementById('seam-transfer');
  const { A, B, reflect, distance } = window.DrumCongruence;
  const input = document.getElementById('seam-position');
  const output = document.getElementById('seam-state');
  const subscript = '₀₁₂₃₄₅₆';
  const teal = '#246d64';
  const rust = '#925039';

  // Vertex numbering follows the shared reference triangle. The 0–1 seam in B is
  // opposite vertex 1. Reflect the same numbered edge on each of A's source tiles.
  function across(tile) {
    return tile.map(p => reflect(p, tile[0], tile[2]));
  }

  const sourceTiles = window.DrumMath.transplant[0].flatMap((sign, i) => sign ? [i] : []);
  const sourcePaths = sourceTiles.map(index => {
    const from = A[index];
    const to = across(from);
    const neighbour = A.findIndex(tile => tile.every((p, i) => distance(p, to[i]) < 1e-8));
    return { from, to, rim: neighbour === -1, index, neighbour };
  });
  const bPath = { from: B[0], to: B[1], rim: false };

  function averagePoint(tile, weights) {
    return tile[0].map((_, axis) => tile.reduce((sum, vertex, i) => sum + weights[i] * vertex[axis], 0));
  }

  function makeDiagram(svg, tiles, paths, active, prefix) {
    const points = tiles.flat();
    const bounds = [0, 1].map(axis => {
      const values = points.map(p => p[axis]);
      return [Math.min(...values), Math.max(...values)];
    });
    const scale = Math.min(288 / (bounds[0][1] - bounds[0][0]), 238 / (bounds[1][1] - bounds[1][0]));
    const project = p => p.map((v, axis) => {
      const [min, max] = bounds[axis];
      return (axis ? 134 : 160) + (v - (min + max) / 2) * scale * (axis ? -1 : 1);
    });

    function add(tag, attributes, label) {
      const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
      Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
      if (label) node.textContent = label;
      svg.append(node);
      return node;
    }

    function line([x1, y1], [x2, y2], stroke, width, dash = '') {
      add('line', { x1, y1, x2, y2, stroke, 'stroke-width': width, 'stroke-dasharray': dash });
    }

    tiles.forEach((tile, i) => {
      const reflected = i >= 7;
      const fill = reflected ? '#f4e6d9' : active.has(i) ? '#dcebe1' : '#f6f7f0';
      const stroke = reflected ? rust : active.has(i) ? teal : '#a8b9aa';
      add('polygon', {
        points: tile.map(p => project(p).join(',')).join(' '), fill, stroke,
        'stroke-width': 1.1, 'stroke-dasharray': reflected ? '5 4' : ''
      });
    });

    const tracks = paths.map(({ from, to, rim }) => {
      // Use the same position relative to the three matching corners on every tile.
      const position = tile => project(averagePoint(tile, [.56, .22, .22]));
      const [start, end] = [position(from), position(to)];
      const color = rim ? rust : teal;
      line(project(from[0]), project(from[2]), color, 2.7, rim ? '5 4' : '');
      line(start, end, color, 1.5);
      const angle = Math.atan2(end[1] - start[1], end[0] - start[0]);
      for (const offset of [-.55, .55]) {
        line(end, [end[0] - 6 * Math.cos(angle + offset), end[1] - 6 * Math.sin(angle + offset)], color, 1.5);
      }
      return { start, end, rim };
    });

    tiles.forEach((tile, i) => {
      const [x, y] = project(averagePoint(tile, [1 / 3, 1 / 3, 1 / 3]));
      const reflected = i >= 7;
      const name = reflected ? '−f' + subscript[paths.find(path => path.rim).index] : prefix + subscript[i];
      add('text', {
        x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        class: reflected ? 'is-reflected' : active.has(i) ? '' : 'is-muted'
      }, name);
    });

    return tracks.map(track => ({
      ...track, dot: add('circle', {
        r: prefix === 'g' ? 6 : 4.8,
        fill: '#fffdf5', stroke: '#203d3b', 'stroke-width': 1.5
      })
    }));
  }

  const targetTracks = makeDiagram(
    document.getElementById('seam-drum-b'), B, [bPath], new Set([0, 1]), 'g'
  );
  const sourceTracks = makeDiagram(
    document.getElementById('seam-drum-a'), [...A, ...sourcePaths.filter(p => p.rim).map(p => p.to)],
    sourcePaths, new Set(sourcePaths.flatMap(({ index, neighbour }) => [index, neighbour])), 'f'
  );

  function render() {
    const t = Number(input.value) / 100;
    for (const { start, end, rim, dot } of [...targetTracks, ...sourceTracks]) {
      dot.setAttribute('cx', start[0] + t * (end[0] - start[0]));
      dot.setAttribute('cy', start[1] + t * (end[1] - start[1]));
      dot.setAttribute('fill', dot === targetTracks[0].dot ? '#ffc247' : rim && t > .5 ? rust : '#fffdf5');
    }
    const state = t < .5 ? 'On B’s tile 0' : t > .5 ? 'On B’s tile 1' : 'On B’s shared edge';
    if (output.textContent !== state) output.textContent = state;
    input.setAttribute('aria-valuetext', state + ' · ' + input.value + '%');
  }

  input.addEventListener('input', render);
  render();
  root.querySelector('.seam-interaction').hidden = false;
})();
