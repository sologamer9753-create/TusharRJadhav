// ═══════════════════════════════════════════════════
// CYBER CAT — A cute, tiny pixel art mascot for the terminal
// ═══════════════════════════════════════════════════

const PIXEL = 5;
const COLS = 16;
const ROWS = 13;

// ASCII representation of the cat frames for easy editing.
// '.' is empty space, '#' is filled pixel.
const ART = {
  idle: [
    "................",
    ".......#....#...",
    ".......##..##...",
    ".......######...",
    ".......#.##.#...", // Eyes open
    ".......######...",
    "......########..",
    "#....#########..",
    "##..##########..",
    ".############...",
    "...##.##..##.#..",
    "................",
    "................"
  ],
  blink: [
    "................",
    ".......#....#...",
    ".......##..##...",
    ".......######...",
    ".......######...", // Eyes closed
    ".......######...",
    "......########..",
    "#....#########..",
    "##..##########..",
    ".############...",
    "...##.##..##.#..",
    "................",
    "................"
  ],
  happy: [
    "................",
    ".......#....#...",
    ".......##..##...",
    ".......######...",
    ".......#....#...", // Happy wide-spaced cute eyes
    ".......######...",
    "......########..",
    "#....#########..",
    "##..##########..",
    ".############...",
    "...##.##..##.#..",
    "................",
    "................"
  ],
  paw_wash: [
    "................",
    "......##....#...", // Paw over left ear!
    "......###..##...",
    ".......######...",
    ".......######...", // Eyes closed in bliss
    ".......######...",
    "......########..",
    "#....#########..",
    "##..##########..",
    ".############...",
    "......##..##.#..", // Left paw raised up
    "................",
    "................"
  ],
  swish1: [
    "................",
    ".......#....#...",
    ".......##..##...",
    ".......######...",
    ".......#.##.#...",
    ".......######...",
    "......########..",
    ".....#########..",
    "...###########..",
    "..###########...",
    "...##.##..##.#..",
    "................",
    "................"
  ],
  swish2: [
    "................",
    "..##...#....#...", // Tail up high!
    ".#.....##..##...",
    ".#.....######...",
    "..#....#.##.#...",
    "...#...######...",
    "......########..",
    ".....#########..",
    ".....#########..",
    ".....########...",
    "...##.##..##.#..",
    "................",
    "................"
  ]
};

// Compile ASCII strings to binary masks for fast rendering
function compileFrames(artObj) {
  const compiled = {};
  for (const [key, lines] of Object.entries(artObj)) {
    compiled[key] = lines.map(line => {
      let num = 0;
      for (let i = 0; i < COLS; i++) {
        num = (num << 1) | (line[i] === '#' ? 1 : 0);
      }
      return num;
    });
  }
  return compiled;
}

const FRAMES = compileFrames(ART);

export function initCyberCat(outputEl) {
  const container = document.createElement('div');
  container.className = 'cyber-cat'; 
  // Base CSS handles float, stickiness, z-index, and pointer-events.

  const canvas = document.createElement('canvas');
  // Extra space for floating hearts to not clip
  canvas.width = COLS * PIXEL + 30; 
  canvas.height = ROWS * PIXEL + 50; 
  container.appendChild(canvas);

  outputEl.appendChild(container);

  const ctx = canvas.getContext('2d');
  
  let currentFrame = 'idle';
  let catColor = '#00ff41'; // Neon green
  let tickCount = 0;
  
  let hearts = [];
  let isCuteMode = false;
  let cuteModeInterval = null;
  let cuteModeTimeout = null;

  // Triggered when "cat" command is entered in terminal
  const onCuteMode = () => {
    container.classList.add('visible');
    outputEl.classList.add('cat-active');
    
    if (isCuteMode) return;
    isCuteMode = true;
    catColor = '#ff66b2'; // Neon light pink!
    
    // Add extra pink glow class or inline filter
    canvas.style.filter = 'drop-shadow(0 0 15px rgba(255, 102, 178, 0.8))';
    
    cuteModeInterval = setInterval(() => {
      spawnHeart();
      // Force happy face temporarily
      currentFrame = 'happy';
      setTimeout(() => { if (isCuteMode) currentFrame = 'idle'; }, 600);
    }, 1500);
    
    // Turn off cute mode after 15 seconds
    clearTimeout(cuteModeTimeout);
    cuteModeTimeout = setTimeout(() => {
      isCuteMode = false;
      clearInterval(cuteModeInterval);
      catColor = '#00ff41';
      canvas.style.filter = 'none';
    }, 15000);
  };
  
  document.addEventListener('cyber-cat-hearts', onCuteMode);

  function spawnHeart() {
    hearts.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 20,
      y: canvas.height - ROWS * PIXEL,
      size: Math.random() * 1.5 + 2,
      vy: -0.5 - Math.random() * 0.8,
      vx: (Math.random() - 0.5) * 0.5,
      life: 1.0,
      decay: 0.008 + Math.random() * 0.01
    });
  }

  function drawPixelFrame(frame, color) {
    const w = canvas.width;
    const h = canvas.height;
    const totalW = COLS * PIXEL;
    const totalH = ROWS * PIXEL;
    const ox = Math.floor((w - totalW) / 2);
    const oy = h - totalH - 5; // Pin near bottom

    ctx.fillStyle = color;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if ((frame[row] >> (COLS - 1 - col)) & 1) {
          ctx.fillRect(ox + col * PIXEL, oy + row * PIXEL, PIXEL - 1, PIXEL - 1);
        }
      }
    }
  }

  function drawHearts() {
    for (let i = hearts.length - 1; i >= 0; i--) {
      let h = hearts[i];
      h.x += h.vx;
      h.y += h.vy;
      h.life -= h.decay;

      if (h.life <= 0) {
        hearts.splice(i, 1);
        continue;
      }

      ctx.fillStyle = `rgba(255, 102, 178, ${h.life})`;
      const s = h.size;
      
      // Draw pixel heart
      ctx.fillRect(h.x - s, h.y - s, s, s);
      ctx.fillRect(h.x + s, h.y - s, s, s);
      ctx.fillRect(h.x - s*2, h.y, s*5, s);
      ctx.fillRect(h.x - s, h.y + s, s*3, s);
      ctx.fillRect(h.x, h.y + s*2, s, s);
    }
  }

  let animationId;
  function renderLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawPixelFrame(FRAMES[currentFrame], catColor);
    drawHearts();
    
    tickCount++;
    
    // Random cute idle animations if not explicitly forced
    if (tickCount % 220 === 0) {
      // Paw Wash!
      currentFrame = 'paw_wash';
      setTimeout(() => currentFrame = 'idle', 300);
      setTimeout(() => currentFrame = 'paw_wash', 600);
      setTimeout(() => currentFrame = 'idle', 900);
    } 
    else if (tickCount % 350 === 0) {
      // Tail Swish!
      currentFrame = 'swish1';
      setTimeout(() => currentFrame = 'swish2', 200);
      setTimeout(() => currentFrame = 'swish1', 400);
      setTimeout(() => currentFrame = 'swish2', 600);
      setTimeout(() => currentFrame = 'idle', 800);
    }
    else if (tickCount % 90 === 0 && tickCount % 220 !== 0 && tickCount % 350 !== 0) {
      // Gentle blink
      currentFrame = 'blink';
      setTimeout(() => currentFrame = 'idle', 150);
    }
    
    animationId = requestAnimationFrame(renderLoop);
  }

  renderLoop();

  // Speech Bubble setup
  const bubble = document.createElement('div');
  bubble.style.position = 'absolute';
  bubble.style.bottom = '90px';
  bubble.style.right = '80px';
  bubble.style.zIndex = '1000';
  bubble.style.background = 'rgba(0, 255, 65, 0.1)';
  bubble.style.border = '1px solid var(--green)';
  bubble.style.color = 'var(--green)';
  bubble.style.padding = '6px 10px';
  bubble.style.borderRadius = '6px';
  bubble.style.fontSize = '0.7rem';
  bubble.style.fontFamily = 'var(--font-mono)';
  bubble.style.whiteSpace = 'nowrap';
  bubble.style.opacity = '0';
  bubble.style.pointerEvents = 'none';
  bubble.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'; // bouncy
  bubble.style.transform = 'translateY(10px) scale(0.9)';
  bubble.style.backdropFilter = 'blur(4px)';
  bubble.style.boxShadow = '0 4px 15px rgba(0, 255, 65, 0.2)';
  container.appendChild(bubble);

  const CUTE_MESSAGES = [
    "nya~ system secured >w<",
    "meow_ware detected! 🐾",
    "purr_rotocol engaged!",
    "root access granted, nya!",
    "firewall is purrfect~",
    "installing catnip.exe...",
  ];

  let bubbleTimeout;

  // Cyber Glitch & Message on Click
  container.addEventListener('click', () => {
    // Quick glitch flash
    catColor = '#00e5ff'; // Cyan glitch
    currentFrame = 'happy';
    
    // Change bubble color dynamically based on mode
    const msgColor = isCuteMode ? '#ff66b2' : 'var(--green)';
    bubble.style.border = `1px solid ${msgColor}`;
    bubble.style.color = msgColor;
    bubble.style.background = isCuteMode ? 'rgba(255, 102, 178, 0.1)' : 'rgba(0, 255, 65, 0.1)';
    bubble.style.boxShadow = `0 4px 15px ${isCuteMode ? 'rgba(255,102,178,0.2)' : 'rgba(0,255,65,0.2)'}`;

    const msg = CUTE_MESSAGES[Math.floor(Math.random() * CUTE_MESSAGES.length)];
    bubble.innerText = msg;
    bubble.style.opacity = '1';
    bubble.style.transform = 'translateY(0px) scale(1)';
    
    clearTimeout(bubbleTimeout);
    bubbleTimeout = setTimeout(() => {
      bubble.style.opacity = '0';
      bubble.style.transform = 'translateY(10px) scale(0.9)';
    }, 3000);

    setTimeout(() => {
      if (!isCuteMode) catColor = '#00ff41';
      else catColor = '#ff66b2';
      currentFrame = 'idle';
    }, 300);
  });

  return () => {
    cancelAnimationFrame(animationId);
    if (cuteModeInterval) clearInterval(cuteModeInterval);
    if (cuteModeTimeout) clearTimeout(cuteModeTimeout);
    document.removeEventListener('cyber-cat-hearts', onCuteMode);
    container.remove();
  };
}
