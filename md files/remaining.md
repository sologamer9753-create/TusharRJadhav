# Remaining Tasks

## 🟢 Fixed (can be closed)

- ✅ **GitHub API fallback bug** — Fixed `repos` → `fallback` variable typo that would crash on API failure
- ✅ **CSP header** — Removed `'wasm-unsafe-eval'` and misplaced `fonts.googleapis.com` from `script-src`
- ✅ **Tab visibility pause** — Matrix rain & Three.js now pause RAF loops when tab is hidden (saves CPU/battery)
- ✅ **OG image placeholder** — Created `public/og-image.png` (replace with proper 1200×630 design)

## 🔴 Must Fix Before Deploy

1. **Replace Formspree ID**
   - File: `index.html` (line ~383)
   - Replace `YOUR_FORM_ID` with actual Formspree form ID
   - Sign up at https://formspree.io/, create a form, copy the ID

## 🟡 Should Do

2. **Create proper OG image** (1200×630px)
   - Current: 1×1 px placeholder
   - Design: Canva / Figma with cyberpunk aesthetic matching site
   - Content: "Tushar R Jadhav — Security Researcher & Creative Developer"
   - Save to `public/og-image.png`, then `npm run build`

3. **Add GitHub token for API** (avoid 60 req/hr limit)
   - Set env var: `VITE_GITHUB_TOKEN=ghp_xxxx` in your deploy platform
   - Token needs only `public_repo` scope

## 🟢 Nice-to-Have

4. **Deploy**
   - `npx vercel` (Vercel) — auto-detects Vite, set output to `dist/`
   - Or: `npx netlify-cli deploy --prod --dir=dist`
   - Add custom domain `tusharjadhav.dev` in DNS settings

5. **Performance check**
   - Run Chrome Lighthouse after deploy
   - Watch for: large Three.js bundle (530KB), 1200 particles on mobile
   - The `prefers-reduced-motion` and mobile particle reduction (600 vs 1200) is already coded

6. **Test contact form** end-to-end after adding Formspree ID

---

## Review Summary (from 2026-07-22 audit)

### Bugs Fixed
- **`github-projects.js:87`** — `repos.forEach` was referencing an out-of-scope variable → would crash on API failure. Changed to `fallback.forEach`.
- **`index.html` CSP** — `script-src` incorrectly allowed `fonts.googleapis.com` (CSS endpoint, not JS) and unnecessary `'wasm-unsafe-eval'`.
- **Tab energy waste** — Matrix rain (`requestAnimationFrame`) and Three.js particles kept running when tab was hidden. Now pause/resume on `visibilitychange`.

### Issues Found (not blocking, flagged for awareness)

| Severity | Issue | Location |
|----------|-------|----------|
| 🟡 Medium | **No error boundary for Three.js** — if WebGL fails, hero section is blank | `three-particles.js` |
| 🟡 Medium | **Floating terminal drag has no boundary clamp** — can be dragged off-screen | `terminal-widget.js` |
| 🟡 Medium | **Easter egg fires inside form fields** — typing "1337" in a form input triggers it | `main.js:initEasterEgg` |
| 🟡 Medium | **Three.js uses full library** (~530KB) but only uses Points + ShaderMaterial — could tree-shake or replace with Canvas2D | `three-particles.js` |
| 🟡 Medium | **1200 particles + matrix rain + CRT overlay** = 3 layered canvas effects on every frame — reduce particles on mobile (currently 600) | `three-particles.js` |
| 🟢 Low | **Only 5 language colors mapped** in project cards; others show no dot | `github-projects.js` |
| 🟢 Low | **Stat counters show `+` suffix** (e.g. `50+`, `15+`) even at max value — confusing for `1000+ hours` | `main.js:animateCounter` |
| 🟢 Low | **Boot screen can't be skipped** — no click-to-skip | `boot-sequence.js` |
| 🟢 Low | **No custom 404 page** — visitors see generic browser error on broken links | `public/` |
| ✅ Fixed | **`repos.forEach` in fallback function** — see bugs fixed above | `github-projects.js` |
| ✅ Fixed | **CSP misconfiguration** — see bugs fixed above | `index.html` |
| ✅ Fixed | **RAF not paused on hidden tab** — see bugs fixed above | `main.js`, `three-particles.js` |
