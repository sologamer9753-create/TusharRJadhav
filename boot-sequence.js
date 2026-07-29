// ═══════════════════════════════════════════════════
// BOOT SEQUENCE — Terminal-style loading screen
// ═══════════════════════════════════════════════════

const bootMessages = [
  { text: '[    0.000000] Initializing security kernel...', cls: 'info', delay: 80 },
  { text: '[    0.184290] Loading security protocols...', cls: 'ok', delay: 120 },
  { text: '[    0.512887] [  OK  ] Establishing encrypted tunnel...', cls: 'ok', delay: 100 },
  { text: '[    0.829156] [  OK  ] Loading firewall rulesets...', cls: 'ok', delay: 70 },
  { text: '[    1.002883] [ WARN ] Unauthorized access attempt blocked.', cls: 'warn', delay: 160 },
  { text: '[    1.342778] Routing through secure proxy chain...', cls: 'ok', delay: 130 },
  { text: '[    1.821004] [  OK  ] Access granted.', cls: 'critical', delay: 200 },
  { text: '[    2.004551] [  OK  ] Loading TUSHAR R JADHAV profile...', cls: 'ok', delay: 100 },
  { text: '[    2.228993] [  OK  ] Clearance: LEVEL 5 — UNRESTRICTED', cls: 'ok', delay: 80 },
  { text: '', cls: '', delay: 100 },
  { text: '> SYSTEM READY. Launching interface...', cls: 'info', delay: 300 },
];

export function runBootSequence(onComplete) {
  const container = document.getElementById('boot-lines');
  const bootScreen = document.getElementById('boot-screen');

  let i = 0;

  function printLine() {
    if (i >= bootMessages.length) {
      setTimeout(() => {
        bootScreen.classList.add('fade-out');
        setTimeout(() => {
          bootScreen.style.display = 'none';
          onComplete();
        }, 500);
      }, 400);
      return;
    }

    const msg = bootMessages[i];
    const line = document.createElement('div');
    line.className = `boot-line ${msg.cls}`;
    line.textContent = msg.text;
    container.appendChild(line);
    container.scrollTop = container.scrollHeight;
    i++;

    setTimeout(printLine, msg.delay);
  }

  printLine();
}
