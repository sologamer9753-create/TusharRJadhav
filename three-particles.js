// ═══════════════════════════════════════════════════
// THREE.JS PARTICLES — Hero 3D particle swarm
// ═══════════════════════════════════════════════════
import * as THREE from 'three';

let animationId = null;
let points = null;
let renderer = null;
let geometry = null;
let material = null;

function generateSkullPoints(count) {
  const points = [];
  const scale = 3.5;

  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    const ring = i / count;

    let x, y, z;

    if (ring < 0.35) {
      const r = (1 - ring * 1.2) * scale * 0.8;
      x = Math.cos(t * 3) * r * (0.6 + 0.4 * Math.sin(t));
      y = scale * 0.5 - ring * scale * 1.5;
      z = Math.sin(t * 2) * r * 0.5;
    } else if (ring < 0.55) {
      const eyeT = (ring - 0.35) / 0.2;
      const side = i % 2 === 0 ? -1 : 1;
      const eyeR = 0.4 * scale * (1 - Math.abs(eyeT - 0.5) * 1.5);
      x = side * scale * 0.3 + Math.cos(t * 5) * eyeR * 0.5;
      y = -eyeT * scale * 0.3;
      z = Math.sin(t * 4) * eyeR * 0.3 + scale * 0.3;
    } else if (ring < 0.75) {
      const jawT = (ring - 0.55) / 0.2;
      x = Math.cos(t * 2) * scale * 0.5 * (1 - jawT * 0.5);
      y = -scale * 0.3 - jawT * scale * 0.4;
      z = Math.sin(t * 2.5) * scale * 0.35 * (1 - jawT * 0.3);
    } else {
      const scatterR = scale * 1.2 + Math.random() * scale * 0.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      x = Math.cos(theta) * Math.sin(phi) * scatterR;
      y = Math.sin(theta) * Math.sin(phi) * scatterR;
      z = Math.cos(phi) * scatterR * 0.5;
    }

    points.push(new THREE.Vector3(x, y, z));
  }

  return points;
}

function pauseAnimation(pause) {
  if (pause && animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  } else if (!pause && !animationId && points) {
    animate();
  }
}

export function initThreeParticles() {
  const container = document.getElementById('three-canvas-container');
  if (!container) return () => { };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1024;
  const isLowEnd = navigator.hardwareConcurrency <= 4 || navigator.deviceMemory <= 4;

  // Reduced motion is an accessibility preference — honor it
  if (prefersReducedMotion) {
    container.style.display = 'none';
    return () => { };
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 8;

  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !isMobile });
  } catch (e) {
    console.warn('WebGL not supported, disabling particles:', e);
    container.style.display = 'none';
    return () => { };
  }
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  container.appendChild(renderer.domElement);

  // Adjust particle count based on device capability — never fully disable on mobile
  let PARTICLE_COUNT;
  if (isMobile) {
    PARTICLE_COUNT = isLowEnd ? 200 : 400;
  } else if (isTablet) {
    PARTICLE_COUNT = 800;
  } else {
    PARTICLE_COUNT = isLowEnd ? 800 : 1200;
  }
  
  const SKULL_POINTS = generateSkullPoints(PARTICLE_COUNT);
  geometry = new THREE.BufferGeometry();

  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const velocities = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

    velocities[i * 3] = 0;
    velocities[i * 3 + 1] = 0;
    velocities[i * 3 + 2] = 0;

    // Cyber palette: green, cyan, magenta
    const mix = Math.random();
    if (mix < 0.5) {
      colors[i * 3] = 0.0;   colors[i * 3 + 1] = 1.0;   colors[i * 3 + 2] = 0.25;
    } else if (mix < 0.85) {
      colors[i * 3] = 0.0;   colors[i * 3 + 1] = 0.9;   colors[i * 3 + 2] = 1.0;
    } else {
      colors[i * 3] = 0.8;   colors[i * 3 + 1] = 0.1;   colors[i * 3 + 2] = 1.0;
    }

    sizes[i] = Math.random() * 0.6 + 0.15;

    // Data-stream axis: some drift left, some right
    velocities[i * 3] = (Math.random() - 0.5) * 0.02;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const vertexShader = `
    attribute float size;
    varying vec3 vColor;
    varying float vSeed;
    void main() {
      vColor = color;
      vSeed = mod(position.x * 13.7 + position.y * 7.3 + position.z * 5.1, 1.0);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (180.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    varying vec3 vColor;
    varying float vSeed;
    void main() {
      vec2 uv = gl_PointCoord - vec2(0.5);
      float flicker = 0.8 + 0.2 * sin(uTime * 3.0 + vSeed * 6.283);
      float aspect = 1.6;
      float d = max(abs(uv.x) * aspect, abs(uv.y));
      if (d > 0.5) discard;
      float sharp = 1.0 - smoothstep(0.3, 0.5, d);
      float glow = exp(-d * 5.0) * 0.1;
      gl_FragColor = vec4(vColor, (sharp + glow) * 0.65 * flicker);
    }
  `;

  material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader,
    fragmentShader,
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  points = new THREE.Points(geometry, material);
  scene.add(points);

  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  function onMouseMove(e) {
    mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
  }
  document.addEventListener('mousemove', onMouseMove);
  
  // Touch support for mobile
  function onTouchMove(e) {
    if (e.touches.length > 0) {
      mouse.targetX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
    }
  }
  document.addEventListener('touchmove', onTouchMove, { passive: true });

  // Pause when tab hidden — animate() checks document.hidden directly
  
  // Handle BFCache (back/forward cache) — some browsers skip visibilitychange on restore
  function onPageShow() {
    if (!animationId && points) animate();
  }
  window.addEventListener('pageshow', onPageShow);

  // WebGL context recovery
  function onContextLost(e) {
    e.preventDefault();
  }
  function onContextRestored() {
    if (!animationId && points) animate();
  }
  renderer.domElement.addEventListener('webglcontextlost', onContextLost);
  renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

  const resizeObserver = new ResizeObserver(() => {
    if (!renderer || !camera || !container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
  resizeObserver.observe(container);

  let time = 0;
  let morphProgress = 0;
  const MORPH_SPEED = 0.003;

  function animate() {
    if (document.hidden) { animationId = null; return; }
    animationId = requestAnimationFrame(animate);

    try {
      time += 0.005;

      if (material) material.uniforms.uTime.value = time;

      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      morphProgress = Math.min(morphProgress + MORPH_SPEED, 1);

      const posAttr = geometry.getAttribute('position');

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;

        if (morphProgress < 1) {
          const skullPoint = SKULL_POINTS[i % SKULL_POINTS.length];
          const ease = easeInOutCubic(morphProgress);

          posAttr.array[i3] += (skullPoint.x - posAttr.array[i3]) * ease * 0.02;
          posAttr.array[i3 + 1] += (skullPoint.y - posAttr.array[i3 + 1]) * ease * 0.02;
          posAttr.array[i3 + 2] += (skullPoint.z - posAttr.array[i3 + 2]) * ease * 0.02;
        } else {
          posAttr.array[i3] += velocities[i3] * 0.5;
          posAttr.array[i3 + 1] += Math.sin(time * 0.3 + i * 0.07) * 0.004;
          posAttr.array[i3 + 2] += Math.sin(time * 0.4 + i * 0.11) * 0.002;

          if (posAttr.array[i3] > 12) posAttr.array[i3] = -12;
          if (posAttr.array[i3] < -12) posAttr.array[i3] = 12;
        }

        const dx = posAttr.array[i3] - mouse.x * 5;
        const dy = posAttr.array[i3 + 1] - mouse.y * 5;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 3) {
          const force = (3 - dist) * 0.08;
          posAttr.array[i3] += dx * force;
          posAttr.array[i3 + 1] += dy * force;
        }
      }

      posAttr.needsUpdate = true;

      points.rotation.y = time * 0.2 + mouse.x * 0.25;
      points.rotation.x = mouse.y * 0.12;

      renderer.render(scene, camera);
    } catch (e) {
      console.warn('Three.js render error — keeping RAF alive:', e);
    }
  }

  animate();

  container._pause = pauseAnimation;

  return () => {
    if (animationId) cancelAnimationFrame(animationId);
    animationId = null;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('pageshow', onPageShow);
    renderer?.domElement.removeEventListener('webglcontextlost', onContextLost);
    renderer?.domElement.removeEventListener('webglcontextrestored', onContextRestored);
    resizeObserver.disconnect();
    // ponytail: don't dispose() or clear innerHTML — browser handles GPU
    // cleanup on unload, and BFCache restore needs the scene alive.
  };
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
