// ════════════════════════════════════════════════════
// GITHUB PROJECTS — Live fetch from GitHub API
// ═══════════════════════════════════════════════════

const GITHUB_USER = 'sologamer9753-create';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

// Optional GitHub token for higher rate limits (5000/hr vs 60/hr)
// Set via: import.meta.env.VITE_GITHUB_TOKEN or window.__GITHUB_TOKEN__
const GITHUB_TOKEN = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GITHUB_TOKEN) || 
                     (typeof window !== 'undefined' && window.__GITHUB_TOKEN__) || 
                     null;

// Map for live demo URLs (repo name → deployed URL)
const DEMO_URLS = {
  portfolioweb: 'https://portfolioweb-theta-drab.vercel.app/',
  sameedit: 'https://sameedit.vercel.app/',
  firsttype: 'https://firsttype.vercel.app/',
  secondone: 'https://secondone-seven.vercel.app/',
  NEBULAportfolio: 'https://nebul-aportfolio.vercel.app/',
  CYBERPUNKportfolio: 'https://cyberpun-kportfolio.vercel.app/',
  MINILUXportfolio: 'https://minilu-xportfolio.vercel.app/',
  VIBERANTportfolio: 'https://viberan-tportfolio.vercel.app/',
};

// Fallback descriptions when GitHub has none
const DESCRIPTIONS = {
  portfolioweb: 'Shogun Creations portfolio — creative agency site with dark industrial design, scroll animations, and responsive layout.',
  sameedit: 'Modified THM website with custom checkings — digital marketing agency full-stack site with Three.js particles and GSAP.',
  firsttype: 'Keystone Estates — Real estate community portal with industrial dark aesthetic, parallax scrolling, and counter animations.',
  secondone: 'Velora Estates — Premium real estate platform with dark industrial design, brass accents, infinite marquee, and bold typography.',
  NEBULAportfolio: 'Nebula Portfolio — clean dark-themed portfolio with gradient accents, smooth scroll reveals, and minimal professional design.',
  CYBERPUNKportfolio: 'Cyberpunk Portfolio — system-terminal themed portfolio with ASCII art, boot sequence UI, and neon grid aesthetics.',
  MINILUXportfolio: 'MiniLux Portfolio — minimal luxury portfolio with refined typography, monochromatic elegance, and subtle micro-interactions.',
  VIBERANTportfolio: 'Viberant Portfolio — vibrant personality-driven portfolio with emoji accents, playful tone, and colorful tech stack grid.',
};

export async function fetchProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  let attempt = 0;

  async function attemptFetch() {
    attempt++;
    try {
      const headers = GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {};
      const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=10`, { headers });
      if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

      // Exclude forks, and this repo itself (it hosts the portfolio, not a project to showcase)
      const repos = (await res.json()).filter(repo => !repo.fork && repo.name !== 'TusharRJadhav');

      if (repos.length === 0) {
        grid.innerHTML = '<div class="loading-projects">NO MISSIONS FOUND</div>';
        return;
      }

      grid.innerHTML = '';

      repos.forEach((repo, index) => {
        const card = createProjectCard(repo, index);
        grid.appendChild(card);

        // Staggered reveal
        setTimeout(() => card.classList.add('visible'), 100 + index * 120);
      });

    } catch (err) {
      console.error(`Failed to fetch projects (attempt ${attempt}/${MAX_RETRIES}):`, err);

      if (attempt < MAX_RETRIES) {
        setTimeout(attemptFetch, RETRY_DELAY);
      } else {
        // All retries exhausted — show fallback
        grid.innerHTML = `
          <div class="loading-projects" style="flex-direction: column; gap: 0.5rem;">
            <span style="color: var(--red);">⚠ TRANSMISSION FAILED</span>
            <span>Could not reach GitHub API after ${MAX_RETRIES} attempts.</span>
            <span style="color: var(--gray); font-size: 0.7rem;">Showing cached fallback data...</span>
          </div>`;
        renderFallbackProjects(grid);
      }
    }
  }

  function renderFallbackProjects(container) {
    const fallback = [
      { name: 'firsttype', description: DESCRIPTIONS.firsttype, language: 'HTML', stars: 0, forks: 0, fork: false, updated_at: '2026-07-22', html_url: 'https://github.com/sologamer9753-create/firsttype' },
      { name: 'secondone', description: DESCRIPTIONS.secondone, language: 'HTML', stars: 0, forks: 0, fork: false, updated_at: '2026-07-22', html_url: 'https://github.com/sologamer9753-create/secondone' },
      { name: 'sameedit', description: DESCRIPTIONS.sameedit, language: 'HTML', stars: 0, forks: 0, fork: false, updated_at: '2026-07-22', html_url: 'https://github.com/sologamer9753-create/sameedit' },
      { name: 'portfolioweb', description: DESCRIPTIONS.portfolioweb, language: 'CSS', stars: 0, forks: 0, fork: false, updated_at: '2026-07-22', html_url: 'https://github.com/sologamer9753-create/portfolioweb' },
      { name: 'NEBULAportfolio', description: DESCRIPTIONS.NEBULAportfolio, language: 'HTML', stars: 0, forks: 0, fork: false, updated_at: '2026-07-22', html_url: 'https://github.com/sologamer9753-create/NEBULAportfolio' },
      { name: 'CYBERPUNKportfolio', description: DESCRIPTIONS.CYBERPUNKportfolio, language: 'HTML', stars: 0, forks: 0, fork: false, updated_at: '2026-07-22', html_url: 'https://github.com/sologamer9753-create/CYBERPUNKportfolio' },
      { name: 'MINILUXportfolio', description: DESCRIPTIONS.MINILUXportfolio, language: 'HTML', stars: 0, forks: 0, fork: false, updated_at: '2026-07-22', html_url: 'https://github.com/sologamer9753-create/MINILUXportfolio' },
      { name: 'VIBERANTportfolio', description: DESCRIPTIONS.VIBERANTportfolio, language: 'HTML', stars: 0, forks: 0, fork: false, updated_at: '2026-07-22', html_url: 'https://github.com/sologamer9753-create/VIBERANTportfolio' },
    ];

    fallback.forEach((repo, index) => {
      const card = createProjectCard(repo, index);
      container.appendChild(card);
      setTimeout(() => card.classList.add('visible'), 100 + index * 120);
    });
  }

  attemptFetch();
}

const LANGUAGE_COLORS = {
  HTML: '#e34c26',
  CSS: '#563d7c',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  TypeScript: '#2b7489',
};

const KNOWN_LANGS = new Set(Object.keys(LANGUAGE_COLORS));

// Escape user-controlled values before injecting into innerHTML.
// Repo names/descriptions are owner-controlled, but descriptions are free text —
// a stray <, >, or quote would otherwise break the markup.
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function hashColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360}, 60%, 50%)`;
}

function createProjectCard(repo, index) {
  const card = document.createElement('div');
  card.className = 'project-card';

  const name = repo.name;
  const desc = repo.description || DESCRIPTIONS[name] || 'No mission briefing available.';
  const lang = repo.language || 'Unknown';
  const stars = repo.stargazers_count || 0;
  const forks = repo.forks_count || 0;
  const isFork = repo.fork;
  const demoUrl = DEMO_URLS[name] || null;
  const repoUrl = repo.html_url;
  const updated = new Date(repo.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  card.innerHTML = `
    <div class="project-header">
      <div class="project-status ${isFork ? 'forked' : ''}"></div>
      <span class="project-name">${esc(name.toUpperCase())}</span>
    </div>
    <p class="project-desc">${esc(desc)}</p>
    <div class="project-meta">
      <span class="project-lang">
        <span class="lang-dot" style="background: ${KNOWN_LANGS.has(lang) ? LANGUAGE_COLORS[lang] : hashColor(lang)}"></span>
        ${esc(lang)}
      </span>
      ${stars > 0 ? `<span class="project-stat">★ ${stars}</span>` : ''}
      ${forks > 0 ? `<span class="project-stat">⑂ ${forks}</span>` : ''}
      <span class="project-stat">Updated ${updated}</span>
    </div>
    <div class="project-links">
      <a href="${esc(repoUrl)}" target="_blank" rel="noopener" class="project-link">SOURCE</a>
      ${demoUrl ? `<a href="${esc(demoUrl)}" target="_blank" rel="noopener" class="project-link demo">DEMO</a>` : ''}
    </div>
  `;

  return card;
}