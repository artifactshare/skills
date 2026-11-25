#!/usr/bin/env node
/**
 * Portable DADS Single-File HTML Bundler (with Official 43-Component Tree-Shaking)
 *
 * Works both inside a standalone installed skill directory (skills/<name>/scripts/bundle.mjs)
 * and from the repository source tree (src/bundle.mjs).
 *
 * Usage:
 *   node bundle.mjs --type doc|dashboard|slides|mockup --input body.html --output out.html
 *     [--title "..."] [--palette blue|light-blue|cyan|green|orange|red|solid-gray]
 *     [--components auto|all|button,table,...] [--theme custom.css] [--script extra.js]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const VALID_TYPES = new Set(['doc', 'dashboard', 'slides', 'mockup']);
const VALID_PALETTES = new Set([
  'blue',
  'light-blue',
  'cyan',
  'green',
  'orange',
  'red',
  'solid-gray',
]);

function resolveAssetRoot() {
  // 1. Standalone skill layout: skills/<name>/scripts/bundle.mjs -> skills/<name>/assets
  const skillAssets = path.resolve(__dirname, '..', 'assets');
  if (fs.existsSync(path.join(skillAssets, 'tokens.css'))) {
    return { mode: 'skill', dir: skillAssets };
  }
  // 2. Repository layout: src/bundle.mjs -> repo root
  const repoRoot = path.resolve(__dirname, '..');
  if (fs.existsSync(path.join(repoRoot, 'vendor', 'dads-design-tokens', 'dist', 'tokens.css'))) {
    return { mode: 'repo', dir: repoRoot };
  }
  throw new Error('Could not locate DADS assets (tokens.css). Run `npm run sync:official` or `npm run build:skills`.');
}

function parseArgs(argv) {
  const args = {
    type: 'doc',
    palette: 'blue',
    title: 'Document',
    input: '',
    output: '',
    theme: '',
    script: '',
    components: 'auto',
    lang: 'ja',
  };
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === '--type' && value) {
      args.type = value;
      i += 1;
    } else if (key === '--palette' && value) {
      args.palette = value;
      i += 1;
    } else if (key === '--title' && value) {
      args.title = value;
      i += 1;
    } else if (key === '--input' && value) {
      args.input = value;
      i += 1;
    } else if (key === '--output' && value) {
      args.output = value;
      i += 1;
    } else if (key === '--theme' && value) {
      args.theme = value;
      i += 1;
    } else if (key === '--script' && value) {
      args.script = value;
      i += 1;
    } else if (key === '--components' && value) {
      args.components = value;
      i += 1;
    } else if (key === '--lang' && value) {
      args.lang = value;
      i += 1;
    }
  }
  return args;
}

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function checkAntiSlop(bodyHtml) {
  const warnings = [];
  if (/border-(left|right|top)\s*:\s*[3-9]\d*px/i.test(bodyHtml)) {
    warnings.push(
      'Inline thick accent border (side-tab / border-accent-on-rounded) detected; use DADS uniform border or highlight surface instead.',
    );
  }
  if (/linear-gradient\s*\(/i.test(bodyHtml)) {
    warnings.push('Inline linear-gradient detected; avoid decorative gradients in DADS output.');
  }
  if (/class="[^"]*dads-slide-kicker[^"]*"/i.test(bodyHtml)) {
    warnings.push('Eyebrow/kicker label above heading detected; let the heading speak without a kicker.');
  }
  if (
    bodyHtml.includes('dads-notification-banner') &&
    !bodyHtml.includes('dads-notification-banner__icon')
  ) {
    warnings.push(
      'dads-notification-banner requires .dads-notification-banner__icon as the first column of .dads-notification-banner__heading.',
    );
  }
  if (bodyHtml.includes('dads-select__select') && !bodyHtml.includes('dads-select__chevron')) {
    warnings.push(
      'dads-select__select hides the native arrow (appearance: none); wrap in .dads-select__control with .dads-select__chevron.',
    );
  }
  return warnings;
}

function detectUsedComponents(bodyHtml, manifest, mode) {
  if (mode === 'all') {
    return manifest;
  }
  if (mode !== 'auto') {
    const requested = new Set(
      mode
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    );
    return manifest.filter((c) => requested.has(c.name));
  }
  const htmlClasses = new Set();
  for (const m of bodyHtml.matchAll(/class\s*=\s*"([^"]+)"/g)) {
    for (const token of m[1].split(/\s+/)) {
      if (token.startsWith('dads-')) htmlClasses.add(token);
    }
  }
  return manifest.filter((comp) => comp.classes.some((cls) => htmlClasses.has(cls)));
}

const DOC_TOC_RUNTIME_JS = `
(() => {
  const doc = document.querySelector('main.dads-doc');
  if (!doc) return;
  const headings = Array.from(doc.querySelectorAll('.dads-section > h2'));
  if (headings.length < 2) return;

  headings.forEach((h, i) => {
    if (!h.id) h.id = 'section-' + (i + 1);
  });

  const buildList = () => {
    const ul = document.createElement('ul');
    ul.className = 'dads-toc-list';
    headings.forEach((h) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'dads-toc-link';
      a.href = '#' + h.id;
      a.textContent = h.textContent?.trim() || '';
      a.dataset.tocTarget = h.id;
      li.appendChild(a);
      ul.appendChild(li);
    });
    return ul;
  };

  const wrapper = document.createElement('div');
  wrapper.className = 'dads-doc-layout';
  doc.parentNode.insertBefore(wrapper, doc);
  wrapper.appendChild(doc);

  const aside = document.createElement('aside');
  aside.className = 'dads-toc';
  aside.setAttribute('aria-label', '目次');
  const title = document.createElement('p');
  title.className = 'dads-toc-title';
  title.textContent = '目次';
  aside.appendChild(title);
  aside.appendChild(buildList());
  wrapper.appendChild(aside);

  const mobile = document.createElement('details');
  mobile.className = 'dads-toc-mobile';
  const summary = document.createElement('summary');
  summary.textContent = '目次を開く';
  const mobileBody = document.createElement('div');
  mobileBody.appendChild(buildList());
  mobile.appendChild(summary);
  mobile.appendChild(mobileBody);
  const header = doc.querySelector('.dads-doc-header');
  if (header) header.insertAdjacentElement('afterend', mobile);

  const allLinks = Array.from(document.querySelectorAll('[data-toc-target]'));
  const setActive = (id) => {
    allLinks.forEach((a) => {
      const active = a.dataset.tocTarget === id;
      a.classList.toggle('is-active', active);
      if (active) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  };

  let clickLockUntil = 0;
  allLinks.forEach((a) => {
    a.addEventListener('click', () => {
      const targetId = a.dataset.tocTarget;
      if (!targetId) return;
      clickLockUntil = Date.now() + 500;
      setActive(targetId);
      if (mobile.open) mobile.open = false;
    });
  });

  const updateFromScroll = () => {
    if (Date.now() < clickLockUntil) return;
    const nearBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8;
    if (nearBottom) {
      setActive(headings[headings.length - 1].id);
      return;
    }
    let current = headings[0].id;
    for (const h of headings) {
      if (h.getBoundingClientRect().top <= 140) {
        current = h.id;
      } else {
        break;
      }
    }
    setActive(current);
  };

  let ticking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        updateFromScroll();
      });
    },
    { passive: true },
  );
  window.addEventListener('hashchange', () => {
    const id = location.hash.replace(/^#/, '');
    if (id && headings.some((h) => h.id === id)) {
      clickLockUntil = Date.now() + 500;
      setActive(id);
    }
  });

  const initialHash = location.hash.replace(/^#/, '');
  if (initialHash && headings.some((h) => h.id === initialHash)) {
    setActive(initialHash);
  } else {
    updateFromScroll();
  }
})();
`.trim();

const SLIDE_RUNTIME_JS = `
(() => {
  const slides = Array.from(document.querySelectorAll('.dads-slide'));
  if (!slides.length) return;
  let index = 0;
  const counter = document.querySelector('[data-slide-counter]');
  const progress = document.querySelector('[data-slide-progress]');

  const update = (next) => {
    index = Math.max(0, Math.min(slides.length - 1, next));
    slides.forEach((el, i) => {
      el.classList.toggle('is-active', i === index);
      el.setAttribute('aria-hidden', i === index ? 'false' : 'true');
    });
    if (counter) counter.textContent = (index + 1) + ' / ' + slides.length;
    if (progress) progress.style.width = ((index + 1) / slides.length) * 100 + '%';
    if (location.hash !== '#' + (index + 1)) {
      history.replaceState(null, '', '#' + (index + 1));
    }
  };

  document.addEventListener('keydown', (e) => {
    if (['ArrowRight', 'PageDown', ' '].includes(e.key)) {
      e.preventDefault();
      update(index + 1);
    } else if (['ArrowLeft', 'PageUp'].includes(e.key)) {
      e.preventDefault();
      update(index - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      update(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      update(slides.length - 1);
    }
  });

  document.querySelector('[data-slide-prev]')?.addEventListener('click', () => update(index - 1));
  document.querySelector('[data-slide-next]')?.addEventListener('click', () => update(index + 1));

  const initial = Number.parseInt(location.hash.replace('#', ''), 10);
  update(Number.isFinite(initial) && initial >= 1 ? initial - 1 : 0);
})();
`.trim();

const MOCKUP_TABS_RUNTIME_JS = `
(() => {
  document.querySelectorAll('[role="tablist"]').forEach((tablist) => {
    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const panelId = tab.getAttribute('aria-controls');
        tabs.forEach((t) => {
          const active = t === tab;
          t.setAttribute('aria-selected', active ? 'true' : 'false');
          const pid = t.getAttribute('aria-controls');
          if (pid) {
            const panel = document.getElementById(pid);
            if (panel) panel.hidden = !active;
          }
        });
        if (panelId) document.getElementById(panelId)?.removeAttribute('hidden');
      });
    });
  });
})();
`.trim();

function main() {
  const args = parseArgs(process.argv);
  if (!VALID_TYPES.has(args.type)) {
    console.error(`Invalid --type: ${args.type}. Expected: doc, dashboard, slides, mockup`);
    process.exit(1);
  }
  if (!VALID_PALETTES.has(args.palette)) {
    console.error(`Invalid --palette: ${args.palette}`);
    process.exit(1);
  }
  if (!args.input || !args.output) {
    console.error('Both --input and --output are required.');
    process.exit(1);
  }

  const root = resolveAssetRoot();
  const tokensCssPath =
    root.mode === 'skill'
      ? path.join(root.dir, 'tokens.css')
      : path.join(root.dir, 'vendor', 'dads-design-tokens', 'dist', 'tokens.css');
  const semanticCssPath =
    root.mode === 'skill'
      ? path.join(root.dir, 'dads-semantic.css')
      : path.join(root.dir, 'src', 'dads-semantic.css');
  const typeCssPath =
    root.mode === 'skill'
      ? path.join(root.dir, `type-${args.type}.css`)
      : path.join(root.dir, 'src', 'types', `${args.type}.css`);
  const componentsBaseDir =
    root.mode === 'skill'
      ? path.join(root.dir, 'components')
      : path.join(root.dir, 'vendor', 'dads-components');

  const officialTokensCss = fs.readFileSync(tokensCssPath, 'utf8');
  const semanticCss = fs.readFileSync(semanticCssPath, 'utf8');
  const typeCss = fs.readFileSync(typeCssPath, 'utf8');
  const themeCss = args.theme ? fs.readFileSync(args.theme, 'utf8') : '';
  const bodyHtml = fs.readFileSync(args.input, 'utf8');
  const extraJs = args.script ? fs.readFileSync(args.script, 'utf8') : '';

  const manifestPath = path.join(componentsBaseDir, 'manifest.json');
  const manifest = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    : [];
  const usedComponents = detectUsedComponents(bodyHtml, manifest, args.components);

  const componentCssBlocks = [];
  for (const comp of usedComponents) {
    for (const cssFile of comp.css) {
      const full = path.join(componentsBaseDir, comp.name, cssFile);
      if (fs.existsSync(full)) {
        componentCssBlocks.push(`/* Official DADS component: ${comp.name}/${cssFile} */\n${fs.readFileSync(full, 'utf8')}`);
      }
    }
  }

  for (const w of checkAntiSlop(bodyHtml)) {
    console.warn(`[anti-slop] ${w}`);
  }

  const scripts = [
    `(() => { const p = new URLSearchParams(location.search).get('palette'); if (p && ['blue','light-blue','cyan','green','orange','red','solid-gray'].includes(p)) { document.documentElement.setAttribute('data-palette', p); } })();`,
  ];
  if (args.type === 'doc') scripts.push(DOC_TOC_RUNTIME_JS);
  if (args.type === 'slides') scripts.push(SLIDE_RUNTIME_JS);
  if (args.type === 'mockup') scripts.push(MOCKUP_TABS_RUNTIME_JS);
  if (extraJs) scripts.push(extraJs);

  const html = `<!doctype html>
<html lang="${escapeHtml(args.lang)}" data-palette="${escapeHtml(args.palette)}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(args.title)}</title>
    <style>
/* Official @digital-go-jp/design-tokens@2.1.0 (MIT) */
${officialTokensCss}
${semanticCss}
${componentCssBlocks.join('\n\n')}
${typeCss}
${themeCss ? `/* Project / Team Theme Override */\n${themeCss}` : ''}
    </style>
  </head>
  <body>
${bodyHtml}
${scripts.length ? `    <script>\n${scripts.join('\n\n')}\n    </script>` : ''}
  </body>
</html>
`;

  fs.mkdirSync(path.dirname(path.resolve(args.output)), { recursive: true });
  fs.writeFileSync(args.output, html, 'utf8');
  const compList = usedComponents.length ? usedComponents.map((c) => c.name).join(', ') : 'none';
  console.log(`Bundled (${args.type}, palette=${args.palette}, components=[${compList}]) -> ${args.output}`);
}

main();
