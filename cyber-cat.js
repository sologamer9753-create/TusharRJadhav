// ═══════════════════════════════════════════════════
// CYBER CAT — A cute, tiny pixel art mascot for the terminal
// ═══════════════════════════════════════════════════
import * as THREE from 'three';

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
    ".......#.##.#...",
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
    ".......######...",
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
    ".......#....#...",
    ".......######...",
    "......########..",
    "#....#########..",
    "##..##########..",
    ".############...",
    "...##.##..##.#..",
    "................",
    "................"
  ],
  lift_paw: [
    "................",
    ".......#....#...",
    ".......##..##...",
    ".......######...",
    ".......#.##.#...",
    ".......######...",
    "......########..",
    "#....#########..",
    "##..##########..",
    ".####.##.####...",
    "...##.....##.#..",
    "................",
    "................"
  ],
  lick_paw_1: [
    "................",
    ".......#....#...",
    ".......##..##...",
    ".......######...",
    ".......######...",
    "......##.####...",
    "......########..",
    "#....#########..",
    "##..##########..",
    ".############...",
    "...##.....##.#..",
    "................",
    "................"
  ],
  lick_paw_2: [
    "................",
    ".......#....#...",
    ".......##..##...",
    ".......######...",
    ".......######...",
    "......#######...",
    "......########..",
    "#....#########..",
    "##..##########..",
    ".############...",
    "...##.....##.#..",
    "................",
    "................"
  ],
  paw_head_1: [
    "................",
    ".......#....#...",
    ".......##..##...",
    "......##.####...",
    "......##.##.#...",
    ".......######...",
    "......########..",
    "#....#########..",
    "##..##########..",
    ".############...",
    "...##.....##.#..",
    "................",
    "................"
  ],
  paw_head_2: [
    "................",
    "......##....#...",
    "......###..##...",
    ".......######...",
    ".......######...",
    ".......######...",
    "......########..",
    "#....#########..",
    "##..##########..",
    ".############...",
    "...##.....##.#..",
    "................",
    "................"
  ],
  paw_head_3: [
    "................",
    ".......#....#...",
    ".......##..##...",
    "......##.####...",
    "......##.####...",
    "......##.####...",
    "......########..",
    "#....#########..",
    "##..##########..",
    ".############...",
    "...##.....##.#..",
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
    "..##...#....#...",
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
  ],
  swish3: [
    "................",
    ".###...#....#...",
    "###....##..##...",
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

function initCrownThree(parentContainer) {
  const crownDom = document.createElement('div');
  crownDom.className = 'cyber-cat-crown-container';
  crownDom.style.position = 'absolute';
  crownDom.style.top = '-5px';
  crownDom.style.left = '50%';
  crownDom.style.transform = 'translateX(-50%)';
  crownDom.style.width = '80px';
  crownDom.style.height = '55px';
  crownDom.style.pointerEvents = 'none';
  crownDom.style.zIndex = '5';
  crownDom.style.filter = 'drop-shadow(0 0 5px rgba(0, 255, 65, 0.75))';
  parentContainer.appendChild(crownDom);

  let crownRenderer = null;
  let crownScene = null;
  let crownCamera = null;
  let crownPoints = null;
  let crownMaterial = null;
  let crownGeometry = null;

  try {
    crownScene = new THREE.Scene();
    crownCamera = new THREE.PerspectiveCamera(45, 80 / 55, 0.1, 100);
    crownCamera.position.set(0, 0.2, 3.2);

    crownRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    crownRenderer.setSize(80, 55);
    crownRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    crownDom.appendChild(crownRenderer.domElement);

    const pointsList = [];
    const colorsList = [];
    const sizesList = [];

    const R = 0.75;
    const numBase = 40;
    const numPeaks = 5;
    const hBand = 0.18;
    const hPeak = 0.7;

    const addP = (x, y, z, r, g, b, size) => {
      pointsList.push(x, y, z);
      colorsList.push(r, g, b);
      sizesList.push(size);
    };

    // 1. Base Ring & Rim (All Cyber Neon Green Palette)
    for (let i = 0; i < numBase; i++) {
      const a = (i / numBase) * Math.PI * 2;
      const ca = Math.cos(a);
      const sa = Math.sin(a);

      addP(ca * R, -0.2, sa * R, 0.0, 1.0, 0.25, 0.22);
      addP(ca * R, -0.2 + hBand, sa * R, 0.15, 1.0, 0.35, 0.25);
      
      if (i % 2 === 0) {
        addP(ca * (R * 1.02), -0.2 + hBand * 0.5, sa * (R * 1.02), 0.0, 0.95, 0.65, 0.2);
      }
    }

    // 2. Crown Peaks/Spikes (5 3D Cyber Spikes)
    const steps = 10;
    for (let k = 0; k < numPeaks; k++) {
      const peakAngle = (k / numPeaks) * Math.PI * 2;
      const nextPeakAngle = ((k + 1) / numPeaks) * Math.PI * 2;
      const valleyAngle = (peakAngle + nextPeakAngle) / 2;

      const px = Math.cos(peakAngle) * (R * 1.05);
      const py = hPeak;
      const pz = Math.sin(peakAngle) * (R * 1.05);

      const vx = Math.cos(valleyAngle) * R;
      const vy = -0.2 + hBand;
      const vz = Math.sin(valleyAngle) * R;

      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const x = vx + (px - vx) * t;
        const y = vy + (py - vy) * t;
        const z = vz + (pz - vz) * t;

        if (s === steps) {
          for (let j = 0; j < 4; j++) {
            const ox = (Math.random() - 0.5) * 0.06;
            const oy = (Math.random() - 0.5) * 0.06;
            const oz = (Math.random() - 0.5) * 0.06;
            const isCyan = k % 2 === 0;
            addP(x + ox, y + oy, z + oz, isCyan ? 0.0 : 0.2, isCyan ? 1.0 : 1.0, isCyan ? 0.8 : 0.4, 0.35);
          }
        } else {
          addP(x, y, z, 0.0, 1.0, 0.25, 0.22);
        }
      }

      const nextVx = Math.cos(nextPeakAngle) * R;
      const nextVy = -0.2 + hBand;
      const nextVz = Math.sin(nextPeakAngle) * R;

      for (let s = 1; s < steps; s++) {
        const t = s / steps;
        const x = px + (nextVx - px) * t;
        const y = py + (nextVy - py) * t;
        const z = pz + (nextVz - pz) * t;
        addP(x, y, z, 0.0, 0.95, 0.45, 0.22);
      }
    }

    // 3. Floating Sparkles around Crown (Cyber Green/Mint)
    for (let i = 0; i < 30; i++) {
      const spR = R * (1.1 + Math.random() * 0.4);
      const spA = Math.random() * Math.PI * 2;
      const spY = -0.2 + Math.random() * 1.1;
      const cMix = Math.random();
      let r = 0.0, g = 1.0, b = 0.25;
      if (cMix < 0.33) { r = 0.0; g = 0.95; b = 0.75; }
      else if (cMix < 0.66) { r = 0.2; g = 1.0; b = 0.4; }
      addP(Math.cos(spA) * spR, spY, Math.sin(spA) * spR, r, g, b, 0.18 + Math.random() * 0.1);
    }

    crownGeometry = new THREE.BufferGeometry();
    crownGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pointsList, 3));
    crownGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colorsList, 3));
    crownGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizesList, 1));

    const vertexShader = `
      attribute float size;
      varying vec3 vColor;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = max(2.0, size * (50.0 / -mvPosition.z));
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      varying vec3 vColor;
      void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);
        float d = length(uv);
        float alpha = 1.0 - smoothstep(0.35, 0.5, d);
        float pulse = 0.85 + 0.15 * sin(uTime * 4.0 + gl_FragCoord.x * 0.1);
        gl_FragColor = vec4(vColor * pulse, alpha * 0.85);
      }
    `;

    crownMaterial = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader,
      fragmentShader,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    crownPoints = new THREE.Points(crownGeometry, crownMaterial);
    crownScene.add(crownPoints);

  } catch (e) {
    console.warn('Three.js crown init error:', e);
  }

  let crownTime = 0;
  function updateCrown(isCute) {
    if (!crownRenderer || !crownScene || !crownCamera || !crownPoints) return;
    
    crownTime += isCute ? 0.025 : 0.015;
    if (crownMaterial) crownMaterial.uniforms.uTime.value = crownTime;

    crownPoints.rotation.y = crownTime * (isCute ? 1.2 : 0.7);
    crownPoints.rotation.x = Math.sin(crownTime * 0.6) * 0.12 + 0.18;
    crownPoints.rotation.z = Math.cos(crownTime * 0.8) * 0.08;
    crownPoints.position.y = Math.sin(crownTime * 2.2) * 0.07 + 0.02;

    crownRenderer.render(crownScene, crownCamera);
  }

  function destroyCrown() {
    if (crownGeometry) crownGeometry.dispose();
    if (crownMaterial) crownMaterial.dispose();
    if (crownRenderer) {
      crownRenderer.dispose();
      crownRenderer.domElement.remove();
    }
    crownDom.remove();
  }

  return { updateCrown, destroyCrown };
}

export function initCyberCat(outputEl) {
  const container = document.createElement('div');
  container.className = 'cyber-cat'; 
  // Base CSS handles float, stickiness, z-index, and pointer-events.

  const crown = initCrownThree(container);

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
    // Pause the loop while the tab is hidden (RAF is throttled anyway, but this
    // also leaves animationId null so the visibilitychange handler knows to restart)
    if (document.hidden) {
      animationId = null;
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawPixelFrame(FRAMES[currentFrame], catColor);
    drawHearts();
    crown?.updateCrown(isCuteMode);
    
    tickCount++;
    
    // Random cute idle animations if not explicitly forced
    if (tickCount % 400 === 0) {
      // Smooth Pet Head and Lick Paw
      let delay = 0;
      const play = (frame, duration) => {
        setTimeout(() => { if (!isCuteMode) currentFrame = frame; }, delay);
        delay += duration;
      };
      
      play('lift_paw', 150);
      play('lick_paw_1', 150);
      play('lick_paw_2', 150);
      play('lick_paw_1', 150);
      play('lick_paw_2', 150);
      
      // Circular face wipe!
      play('paw_head_1', 150);
      play('paw_head_2', 250);
      play('paw_head_3', 250);
      
      play('paw_head_1', 150);
      play('paw_head_2', 250);
      play('paw_head_3', 250);
      
      play('paw_head_1', 150);
      play('lift_paw', 150);
      play('idle', 150);
    } 
    else if (tickCount % 250 === 0 && tickCount % 400 !== 0) {
      // Smooth Tail Swish
      let delay = 0;
      const play = (frame, duration) => {
        setTimeout(() => { if (!isCuteMode) currentFrame = frame; }, delay);
        delay += duration;
      };
      play('swish1', 150);
      play('swish2', 150);
      play('swish3', 300);
      play('swish2', 150);
      play('swish1', 150);
      play('idle', 150);
    }
    else if (tickCount % 90 === 0 && tickCount % 400 !== 0 && tickCount % 250 !== 0) {
      // Gentle blink
      if (!isCuteMode) {
        currentFrame = 'blink';
        setTimeout(() => { if (!isCuteMode) currentFrame = 'idle'; }, 150);
      }
    }
    
    animationId = requestAnimationFrame(renderLoop);
  }

  renderLoop();

  // Stop rendering when the tab is hidden (battery/CPU), restart on return
  const onVisibilityChange = () => {
    if (document.hidden) {
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    } else if (animationId === null) {
      renderLoop();
    }
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

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
    "*purr purr purr...*",
    "*happy cyber cat noises*",
    "pet accepted! ♥",
  ];

  let bubbleTimeout;

  // Cyber Glitch & Message on Click/Tap
  function handleClick() {
    // Quick glitch flash
    catColor = '#00e5ff'; // Cyan glitch
    currentFrame = 'happy';
    
    // Spawn some hearts for the petting interaction
    spawnHeart();
    spawnHeart();
    
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
  }

  let touchFired = false;
  container.addEventListener('touchstart', (e) => {
    touchFired = true;
    handleClick();
    e.preventDefault();
  }, { passive: false });
  container.addEventListener('click', (e) => {
    if (touchFired) { touchFired = false; return; }
    handleClick();
  });

  return () => {
    cancelAnimationFrame(animationId);
    if (cuteModeInterval) clearInterval(cuteModeInterval);
    if (cuteModeTimeout) clearTimeout(cuteModeTimeout);
    crown?.destroyCrown();
    document.removeEventListener('cyber-cat-hearts', onCuteMode);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    container.remove();
  };
}
