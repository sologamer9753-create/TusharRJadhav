// ═══════════════════════════════════════════════════
// MATRIX RAIN — Cyberpunk multi-colored canvas stream
// ═══════════════════════════════════════════════════

const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>{}[]|/\\01';

const COLOR_STREAM = [
  '#00ff41', // Matrix Cyber Green
  '#00cc33', // Dimmed Green
  '#00e5ff', // Ice Cyan
];

let animationId = null;
let ctx = null;
let w = 0, h = 0, columns = 0, drops = [], columnColors = [];
let charSpacing = 18;
let resizeTimeout = null;

function debouncedResize(canvas) {
  if (resizeTimeout) clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => resize(canvas), 150);
}

function resize(canvas) {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
  const fontSize = Math.max(10, Math.min(14, Math.floor(w / 60)));
  charSpacing = fontSize + 4;
  columns = Math.floor(w / charSpacing);
  drops = Array(columns).fill(1);
  columnColors = Array.from({ length: columns }, () =>
    COLOR_STREAM[Math.floor(Math.random() * COLOR_STREAM.length)]
  );
}

function draw() {
  if (!ctx || document.hidden) { animationId = null; return; }
  
  ctx.fillStyle = 'rgba(6, 7, 19, 0.08)';
  ctx.fillRect(0, 0, w, h);

  const fontSize = charSpacing - 4;
  ctx.font = `${fontSize}px JetBrains Mono, monospace`;

  for (let i = 0; i < columns; i++) {
    const char = CHARS[Math.floor(Math.random() * CHARS.length)];
    const x = i * charSpacing;
    const y = drops[i] * charSpacing;

    if (Math.random() > 0.85) {
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.9;
    } else {
      ctx.fillStyle = columnColors[i];
      ctx.globalAlpha = 0.3 + Math.random() * 0.4;
    }

    ctx.fillText(char, x, y);
    ctx.globalAlpha = 1;

    if (y > h && Math.random() > 0.975) {
      drops[i] = 0;
      columnColors[i] = COLOR_STREAM[Math.floor(Math.random() * COLOR_STREAM.length)];
    }
    drops[i]++;
  }

  animationId = requestAnimationFrame(draw);
}

export function initMatrixRain() {
  const canvas = document.getElementById('matrix-rain');
  if (!canvas) return;
  
  ctx = canvas.getContext('2d');
  resize(canvas);
  const onResize = () => debouncedResize(canvas);
  window.addEventListener('resize', onResize);

  draw();

  // Expose pause function on canvas
  canvas._pause = (hidden) => {
    if (hidden && animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    } else if (!hidden && !animationId) {
      draw();
    }
  };

  return () => {
    if (animationId) cancelAnimationFrame(animationId);
    if (resizeTimeout) clearTimeout(resizeTimeout);
    window.removeEventListener('resize', onResize);
  };
}
