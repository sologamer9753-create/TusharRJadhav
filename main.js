// ═══════════════════════════════════════════════════
// MAIN.JS — App entry, typewriter, scroll FX, nav
// ═══════════════════════════════════════════════════

import { runBootSequence } from './boot-sequence.js';
import { initMatrixRain } from './matrix-rain.js';
import { initThreeParticles } from './three-particles.js';
import { initTerminal } from './terminal-widget.js';
import { fetchProjects } from './github-projects.js';
import { initCyberCat } from './cyber-cat.js';

// ─── CONFIG ──────────────────────────────────────
const INTERSECTION_THRESHOLD = 0.1;
const IS_MOBILE = window.innerWidth < 768;
const IS_TABLET = window.innerWidth >= 768 && window.innerWidth <= 1024;

// ─── VIEWPORT HEIGHT FIX (mobile browser chrome) ───
function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
setViewportHeight();
let vhTimeout;
window.addEventListener('resize', () => {
  clearTimeout(vhTimeout);
  vhTimeout = setTimeout(setViewportHeight, 150);
});

// ─── STATE ───────────────────────────────────────
let cleanupFns = [];

// ─── BOOT ────────────────────────────────────────
runBootSequence(() => {
  document.getElementById('site')?.classList.remove('hidden');
  
  cleanupFns.push(initMatrixRain());
  cleanupFns.push(initThreeParticles());
  cleanupFns.push(initTerminal());

  const ftContainer = document.getElementById('floating-terminal');
  if (ftContainer) cleanupFns.push(initCyberCat(ftContainer));

  fetchProjects();
  
  initTypewriter();
  initScrollObservers();
  initContactForm();
  initEasterEgg();
  initNav();
  initMobileMenu();
});

// ─── GLOBAL CLEANUP ──────────────────────────────
window.addEventListener('beforeunload', () => {
  cleanupFns.forEach(fn => fn && fn());
  cleanupFns = [];
});

// Pause scanline & heavy animations when tab hidden
document.addEventListener('visibilitychange', () => {
  const hidden = document.hidden;
  document.documentElement.setAttribute('visibility-state', hidden ? 'hidden' : 'visible');

  const matrixCanvas = document.getElementById('matrix-rain');
  if (matrixCanvas && matrixCanvas._pause) {
    matrixCanvas._pause(hidden);
  }

  const threeContainer = document.getElementById('three-canvas-container');
  if (threeContainer && threeContainer._pause) {
    threeContainer._pause(hidden);
  }
});

// ─── TYPEWRITER ──────────────────────────────────
function initTypewriter() {
  const el = document.querySelector('.typewriter-text');
  if (!el) return;

  const fullText = 'tushar@shogun:~$ ./whoami';
  let i = 0;

  function type() {
    if (i <= fullText.length) {
      el.textContent = fullText.slice(0, i);
      i++;
      setTimeout(type, 70 + Math.random() * 50);
    }
  }

  setTimeout(type, 600);
}

// ─── CONSOLIDATED SCROLL OBSERVERS ───────────────
function initScrollObservers() {
  // Single observer for reveal animations
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: INTERSECTION_THRESHOLD }
  );

  document.querySelectorAll('.reveal, .slide-left, .slide-right, .project-card').forEach((el) => {
    revealObserver.observe(el);
  });

  // About terminal line-by-line reveal
  const aboutText = document.querySelector('.about-text');
  if (aboutText) {
    const aboutObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const lines = entry.target.querySelectorAll('p');
          lines.forEach((p, i) => {
            setTimeout(() => p.classList.add('visible'), i * 150);
          });
          aboutObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    aboutObserver.observe(aboutText);
  }
}

function initEasterEgg() {
  let buffer = '';

  document.addEventListener('keydown', (e) => {
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;

    buffer += e.key;
    if (buffer.length > 4) buffer = buffer.slice(-4);

    if (buffer === '1337') {
      buffer = '';
      showEasterEgg();
    }
  });
}

function showEasterEgg() {
  const overlay = document.getElementById('easter-egg');
  if (!overlay) return;
  overlay.classList.add('visible');

  const dismiss = () => overlay.classList.remove('visible');
  const timer = setTimeout(dismiss, 3500);

  // Dismiss on any interaction on mobile
  overlay.addEventListener('click', dismiss, { once: true });
  overlay.addEventListener('touchend', dismiss, { once: true });

  // Store cleanup to prevent leaks
  overlay._easterCleanup = () => {
    clearTimeout(timer);
    overlay.classList.remove('visible');
  };
}

// ─── NAV ─────────────────────────────────────────
function initNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = `#${entry.target.id}`;
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === id);
          });
          mobileLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === id);
          });
        }
      });
    },
    { threshold: 0.3 }
  );

  sections.forEach((section) => observer.observe(section));
}



// ─── MOBILE MENU ─────────────────────────────────
function initMobileMenu() {
  const btn = document.getElementById('nav-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = menu.classList.toggle('open');
    btn.classList.toggle('active', open);
    btn.setAttribute('aria-expanded', open);
  });

  menu.querySelectorAll('.mobile-link').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (menu.classList.contains('open') && !menu.contains(e.target) && !btn.contains(e.target)) {
      menu.classList.remove('open');
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      menu.classList.remove('open');
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

// ─── CONTACT FORM ────────────────────────────────
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  let submitting = false;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submitting) return;
    submitting = true;

    const submitBtn = form.querySelector('.btn-submit');
    const originalText = submitBtn.querySelector('.btn-glitch').textContent;

    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-glitch').textContent = 'TRANSMITTING...';

    try {
      const formData = new FormData(form);
      const res = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        submitBtn.querySelector('.btn-glitch').textContent = 'MESSAGE ENCRYPTED ✓';
        submitBtn.style.background = 'var(--green)';
        form.reset();
      } else {
        throw new Error('Form submission failed');
      }
    } catch (err) {
      submitBtn.querySelector('.btn-glitch').textContent = 'TRANSMISSION FAILED ✗';
      submitBtn.style.background = 'var(--red)';
      console.error('Contact form error:', err);
    }

    setTimeout(() => {
      submitBtn.disabled = false;
      submitting = false;
      submitBtn.querySelector('.btn-glitch').textContent = originalText;
      submitBtn.style.background = '';
    }, 3000);
  });
}
