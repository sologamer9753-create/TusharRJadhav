// ═══════════════════════════════════════════════════
// TERMINAL WIDGET — Floating draggable terminal
// ═══════════════════════════════════════════════════

const COMMANDS = {
  help: () => [
    'Available commands:',
    '  help      — Show this message',
    '  whoami    — Display user info',
    '  skills    — List skills',
    '  projects  — Navigate to projects',
    '  contact   — Navigate to contact',
    '  clear     — Clear terminal',
    '  date      — Current date/time',
    '  uname     — System info',
    '  sudo      — Try it ;)',
    '  cat       — Summon the cyber kitty!',
    '  exit      — Close terminal',
  ],
  whoami: () => [
    'Tushar R Jadhav',
    'Alias: sologamer9753',
    'Role: Security Researcher & Creative Developer',
    'Org: Shogun Creations (Founder)',
    'Status: ACTIVE — All systems nominal.',
  ],
  skills: () => [
    '=== OFFENSE ===',
    '  [██████████░] Network Security — 85%',
    '  [████████░░░] Ethical Hacking — 80%',
    '  [███████░░░░] Penetration Testing — 75%',
    '  [██████░░░░░] Cryptography — 70%',
    '',
    '=== CRAFT ===',
    '  [█████████░░] Three.js / WebGL — 90%',
    '  [█████████░░] GSAP / Animations — 92%',
    '  [██████████░] HTML / CSS / JS — 95%',
    '  [███████░░░░] React / Next.js — 78%',
  ],
  projects: () => {
    setTimeout(() => {
      document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return ['Navigating to PROJECTS section...', '>> Loading mission files...'];
  },
  contact: () => {
    setTimeout(() => {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return ['Navigating to CONTACT section...', '>> Initializing encrypted channel...'];
  },
  clear: () => 'CLEAR',
  date: () => [new Date().toString()],
  uname: () => [
    'SHOGUN SECURE OS v3.7.1',
    'Kernel: 6.2.0-shogun',
    'Arch: x86_64',
    'Shell: shogun-terminal/1.0',
  ],
  sudo: () => [
    'Nice try. 🛡️',
    'But this terminal requires root access that you don\'t have.',
    '...or do you?',
    '',
    '[ACCESS DENIED]',
  ],
  cat: () => {
    document.dispatchEvent(new CustomEvent('cyber-cat-hearts'));
    return [
      '🐾 MEOW!',
      '>> Activating cute overload mode...',
    ];
  },
  exit: () => 'EXIT',
};

export function initTerminal() {
  const terminal = document.getElementById('floating-terminal');
  const toggle = document.getElementById('terminal-toggle');
  const input = document.getElementById('ft-input');
  const output = document.getElementById('ft-output');
  const closeBtn = document.getElementById('ft-close');
  const minimizeBtn = document.getElementById('ft-minimize');
  const dragHandle = document.getElementById('ft-drag-handle');

  let isOpen = false;

  // Toggle terminal
  function onToggleClick() {
    isOpen = !isOpen;
    terminal.classList.toggle('open', isOpen);
    terminal.classList.remove('minimized');
    terminal.setAttribute('aria-hidden', !isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
    if (isOpen) input.focus();
  }
  toggle.addEventListener('click', onToggleClick);

  function onCloseClick() {
    isOpen = false;
    terminal.classList.remove('open');
    terminal.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
  }
  closeBtn.addEventListener('click', onCloseClick);

  function onMinimizeClick() {
    terminal.classList.add('minimized');
    setTimeout(() => { 
      isOpen = false; 
      terminal.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
    }, 300);
  }
  minimizeBtn.addEventListener('click', onMinimizeClick);

  // Drag functionality with boundary clamping
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };

  function getPos(e) {
    return e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
  }

  function onDragStart(e) {
    isDragging = true;
    const pos = getPos(e);
    const rect = terminal.getBoundingClientRect();
    dragOffset.x = pos.x - rect.left;
    dragOffset.y = pos.y - rect.top;
    terminal.style.transition = 'none';
  }
  dragHandle.addEventListener('mousedown', onDragStart);
  dragHandle.addEventListener('touchstart', onDragStart, { passive: true });

  function onDragMove(e) {
    if (!isDragging) return;
    const pos = getPos(e);
    const maxX = window.innerWidth - terminal.offsetWidth;
    const maxY = window.innerHeight - terminal.offsetHeight;
    let left = Math.max(0, Math.min(pos.x - dragOffset.x, maxX));
    let top = Math.max(0, Math.min(pos.y - dragOffset.y, maxY));
    terminal.style.left = `${left}px`;
    terminal.style.top = `${top}px`;
    terminal.style.right = 'auto';
    terminal.style.bottom = 'auto';
  }
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('touchmove', onDragMove, { passive: true });

  function onDragEnd() {
    isDragging = false;
    terminal.style.transition = '';
  }
  document.addEventListener('mouseup', onDragEnd);
  document.addEventListener('touchend', onDragEnd);

  // Command execution
  function onInputKeydown(e) {
    if (e.key === 'Enter') {
      const cmd = input.value.trim().toLowerCase();
      input.value = '';

      // Add command line to output
      addLine(`tushar@shogun:~$ ${cmd}`, 'cyan');

      if (!cmd) return;

      // Process command
      const handler = COMMANDS[cmd];
      if (handler) {
        const result = handler();
        if (result === 'CLEAR') {
          output.innerHTML = '';
        } else if (result === 'EXIT') {
          isOpen = false;
          terminal.classList.remove('open');
        } else {
          result.forEach(line => addLine(line, ''));
        }
      } else {
        addLine(`Command not found: ${cmd}. Type 'help' for available commands.`, 'red');
      }

      output.scrollTop = output.scrollHeight;
    }
  }
  input.addEventListener('keydown', onInputKeydown);

  function addLine(text, cls) {
    const line = document.createElement('p');
    line.className = `ft-line ${cls}`;
    line.textContent = text;
    output.appendChild(line);
  }

  // Return cleanup function
  return () => {
    toggle.removeEventListener('click', onToggleClick);
    closeBtn.removeEventListener('click', onCloseClick);
    minimizeBtn.removeEventListener('click', onMinimizeClick);
    dragHandle.removeEventListener('mousedown', onDragStart);
    dragHandle.removeEventListener('touchstart', onDragStart);
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('touchmove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
    document.removeEventListener('touchend', onDragEnd);
    input.removeEventListener('keydown', onInputKeydown);
  };
}
