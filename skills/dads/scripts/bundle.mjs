#!/usr/bin/env node
/**
 * Portable DADS Single-File HTML Bundler (with 43-Component Tree-Shaking)
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

const WALKTHROUGH_RUNTIME_JS = `
(() => {
  document.querySelectorAll('.dads-walkthrough').forEach((root) => {
    const buttons = [...root.querySelectorAll('[data-step]')];
    const targets = [...root.querySelectorAll('[data-step-target]')];
    if (!buttons.length) return;
    const activate = (step) => {
      buttons.forEach((b) => b.classList.toggle('is-active', b.getAttribute('data-step') === step));
      targets.forEach((t) => t.classList.toggle('is-active', t.getAttribute('data-step-target') === step));
    };
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => activate(btn.getAttribute('data-step')));
    });
    const initial = buttons.find((b) => b.classList.contains('is-active')) || buttons[0];
    if (initial) activate(initial.getAttribute('data-step'));
  });
})();
`.trim();

const CHART_COLORS = [
  'var(--dads-chart-1)',
  'var(--dads-chart-2)',
  'var(--dads-chart-3)',
  'var(--dads-chart-4)',
  'var(--dads-chart-6)',
  'var(--color-neutral-solid-gray-500)',
];

function fmtNum(n) {
  return Number.isFinite(n) ? n.toLocaleString('ja-JP') : String(n);
}

function niceMax(val) {
  if (!Number.isFinite(val) || val <= 0) return 10;
  const exp = Math.floor(Math.log10(val));
  const base = Math.pow(10, exp);
  const f = val / base;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nice * base;
}

function chartHead(spec) {
  if (!spec.title && !spec.subtitle) return '';
  return `<div class="dads-chart-head">${spec.title ? `<h3 class="dads-chart-title">${escapeHtml(spec.title)}</h3>` : ''}${spec.subtitle ? `<span class="dads-chart-sub">${escapeHtml(spec.subtitle)}</span>` : ''}</div>`;
}

function chartLegend(names) {
  if (!names || names.length <= 1) return '';
  const items = names
    .map(
      (name, i) =>
        `<span class="dads-chart-legend-item"><span class="dads-chart-swatch" style="background:${CHART_COLORS[i % CHART_COLORS.length]}"></span><span>${escapeHtml(name)}</span></span>`,
    )
    .join('');
  return `<div class="dads-chart-legend">${items}</div>`;
}

function renderHbarChart(spec) {
  const items = spec.items || [];
  const unit = spec.unit || '';
  const maxVal = Math.max(1, ...items.map((d) => Number(d.value) || 0));
  const rowH = 34;
  const labelW = 148;
  const valueW = 76;
  const barW = 360;
  const W = labelW + barW + valueW + 16;
  const H = Math.max(48, items.length * rowH + 8);
  const rows = items
    .map((item, i) => {
      const val = Number(item.value) || 0;
      const y = i * rowH + 6;
      const w = Math.max(2, (val / maxVal) * barW);
      const fill = item.highlight ? 'var(--dads-chart-1)' : 'var(--dads-chart-2)';
      return `
        <text x="${labelW - 10}" y="${y + 16}" text-anchor="end" font-size="12.5" font-weight="${item.highlight ? '700' : '500'}" fill="#1a1a1c">${escapeHtml(item.label)}</text>
        <rect x="${labelW}" y="${y + 4}" width="${barW}" height="18" rx="4" fill="#e8e8ee" />
        <rect x="${labelW}" y="${y + 4}" width="${w.toFixed(1)}" height="18" rx="4" fill="${fill}" />
        <text x="${labelW + barW + 8}" y="${y + 17}" font-size="12.5" font-weight="700" fill="#1a1a1c">${escapeHtml(fmtNum(val) + unit)}</text>`;
    })
    .join('');
  return `<div class="dads-chart-svg-wrap"><svg class="dads-chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeHtml(spec.title || '横棒グラフ')}">${rows}</svg></div>`;
}

function renderBarChart(spec) {
  const labels = spec.labels || [];
  const series = spec.series || [];
  const unit = spec.unit || '';
  const allVals = series.flatMap((s) => s.values || []).map((v) => Number(v) || 0);
  const yMax = niceMax(Math.max(1, ...allVals));
  const W = 580;
  const H = 240;
  const pad = { top: 24, right: 16, bottom: 34, left: 48 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const grid = ticks
    .map((t) => {
      const y = pad.top + plotH * (1 - t);
      const v = Math.round(yMax * t);
      return `<line x1="${pad.left}" y1="${y.toFixed(1)}" x2="${W - pad.right}" y2="${y.toFixed(1)}" stroke="#e0e0e6" stroke-width="1" />
        <text x="${pad.left - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="#626266">${escapeHtml(fmtNum(v))}</text>`;
    })
    .join('');
  const groupW = plotW / Math.max(1, labels.length);
  const innerW = Math.min(groupW * 0.72, 88);
  const bw = innerW / Math.max(1, series.length);
  const bars = labels
    .map((label, gi) => {
      const gx = pad.left + gi * groupW + (groupW - innerW) / 2;
      const rects = series
        .map((s, si) => {
          const val = Number((s.values || [])[gi]) || 0;
          const bh = (val / yMax) * plotH;
          const x = gx + si * bw + 1;
          const y = pad.top + plotH - bh;
          return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(4, bw - 2).toFixed(1)}" height="${Math.max(1, bh).toFixed(1)}" rx="3" fill="${CHART_COLORS[si % CHART_COLORS.length]}" />
            <text x="${(x + Math.max(4, bw - 2) / 2).toFixed(1)}" y="${(y - 5).toFixed(1)}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#1a1a1c">${escapeHtml(fmtNum(val) + (series.length === 1 ? unit : ''))}</text>`;
        })
        .join('');
      const lx = pad.left + gi * groupW + groupW / 2;
      return `${rects}<text x="${lx.toFixed(1)}" y="${H - 10}" text-anchor="middle" font-size="11.5" fill="#4a4a4f">${escapeHtml(label)}</text>`;
    })
    .join('');
  return `<div class="dads-chart-svg-wrap"><svg class="dads-chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeHtml(spec.title || '縦棒グラフ')}">${grid}${bars}</svg></div>${chartLegend(series.map((s) => s.name))}`;
}

function renderStackedChart(spec) {
  const rows = spec.rows || [];
  const names = spec.seriesNames || [];
  const rowH = 38;
  const labelW = 124;
  const barW = 420;
  const W = labelW + barW + 16;
  const H = Math.max(48, rows.length * rowH + 8);
  const content = rows
    .map((row, ri) => {
      const vals = (row.values || []).map((v) => Math.max(0, Number(v) || 0));
      const sum = vals.reduce((a, b) => a + b, 0) || 1;
      const y = ri * rowH + 8;
      let cursor = labelW;
      const segs = vals
        .map((v, si) => {
          const pct = (v / sum) * 100;
          const w = (v / sum) * barW;
          const x = cursor;
          cursor += w;
          const labelTxt = pct >= 12 ? `<text x="${(x + w / 2).toFixed(1)}" y="${y + 15}" text-anchor="middle" font-size="11" font-weight="700" fill="${si <= 1 ? '#ffffff' : '#1a1a1c'}">${Math.round(pct)}%</text>` : '';
          return `<rect x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="22" fill="${CHART_COLORS[si % CHART_COLORS.length]}" />${labelTxt}`;
        })
        .join('');
      return `<text x="${labelW - 10}" y="${y + 15}" text-anchor="end" font-size="12.5" font-weight="600" fill="#1a1a1c">${escapeHtml(row.label)}</text>${segs}`;
    })
    .join('');
  return `<div class="dads-chart-svg-wrap"><svg class="dads-chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeHtml(spec.title || '100% 積み上げ帯グラフ')}">${content}</svg></div>${chartLegend(names)}`;
}

function renderLineChart(spec) {
  const labels = spec.labels || [];
  const series = spec.series || [];
  const unit = spec.unit || '';
  const allVals = series.flatMap((s) => s.values || []).map((v) => Number(v) || 0);
  if (spec.target && Number.isFinite(Number(spec.target.value))) {
    allVals.push(Number(spec.target.value));
  }
  const yMax = niceMax(Math.max(1, ...allVals));
  const W = 580;
  const H = 240;
  const pad = { top: 24, right: 24, bottom: 34, left: 50 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const grid = ticks
    .map((t) => {
      const y = pad.top + plotH * (1 - t);
      const v = Math.round(yMax * t);
      return `<line x1="${pad.left}" y1="${y.toFixed(1)}" x2="${W - pad.right}" y2="${y.toFixed(1)}" stroke="#e0e0e6" stroke-width="1" />
        <text x="${pad.left - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="#626266">${escapeHtml(fmtNum(v))}</text>`;
    })
    .join('');
  const xPos = (i) =>
    labels.length <= 1 ? pad.left + plotW / 2 : pad.left + (i / (labels.length - 1)) * plotW;
  const yPos = (v) => pad.top + plotH - (v / yMax) * plotH;
  const xLabels = labels
    .map(
      (lbl, i) =>
        `<text x="${xPos(i).toFixed(1)}" y="${H - 10}" text-anchor="middle" font-size="11.5" fill="#4a4a4f">${escapeHtml(lbl)}</text>`,
    )
    .join('');
  let targetLine = '';
  if (spec.target && Number.isFinite(Number(spec.target.value))) {
    const ty = yPos(Number(spec.target.value));
    targetLine = `<line x1="${pad.left}" y1="${ty.toFixed(1)}" x2="${W - pad.right}" y2="${ty.toFixed(1)}" stroke="#ce0000" stroke-width="1.5" stroke-dasharray="5 4" />
      <text x="${W - pad.right}" y="${(ty - 5).toFixed(1)}" text-anchor="end" font-size="11" font-weight="700" fill="#ce0000">${escapeHtml(spec.target.label || '目標: ' + fmtNum(spec.target.value) + unit)}</text>`;
  }
  const paths = series
    .map((s, si) => {
      const vals = (s.values || []).map((v) => Number(v) || 0);
      const color = CHART_COLORS[si % CHART_COLORS.length];
      const pts = vals.map((v, i) => `${xPos(i).toFixed(1)},${yPos(v).toFixed(1)}`).join(' ');
      const dots = vals
        .map((v, i) => {
          const cx = xPos(i);
          const cy = yPos(v);
          const showLbl = series.length === 1 || i === vals.length - 1;
          const lbl = showLbl
            ? `<text x="${cx.toFixed(1)}" y="${(cy - 9).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="700" fill="#1a1a1c">${escapeHtml(fmtNum(v) + unit)}</text>`
            : '';
          return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="4" fill="#ffffff" stroke="${color}" stroke-width="2.5" />${lbl}`;
        })
        .join('');
      return `<polyline fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" points="${pts}" />${dots}`;
    })
    .join('');
  return `<div class="dads-chart-svg-wrap"><svg class="dads-chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeHtml(spec.title || '折れ線グラフ')}">${grid}${targetLine}${paths}${xLabels}</svg></div>${chartLegend(series.map((s) => s.name))}`;
}

function renderDonutChart(spec) {
  const items = spec.items || [];
  const unit = spec.unit || '';
  const total = items.reduce((a, b) => a + Math.max(0, Number(b.value) || 0), 0) || 1;
  const r = 64;
  const C = 2 * Math.PI * r;
  let offset = 0;
  const circles = items
    .map((item, i) => {
      const val = Math.max(0, Number(item.value) || 0);
      const dash = (val / total) * C;
      const seg = `<circle cx="90" cy="90" r="${r}" fill="none" stroke="${CHART_COLORS[i % CHART_COLORS.length]}" stroke-width="24" stroke-dasharray="${dash.toFixed(2)} ${(C - dash).toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}" transform="rotate(-90 90 90)" />`;
      offset += dash;
      return seg;
    })
    .join('');
  const list = items
    .map((item, i) => {
      const val = Math.max(0, Number(item.value) || 0);
      const pct = Math.round((val / total) * 100);
      return `<li class="dads-chart-donut-row"><span class="dads-chart-legend-item"><span class="dads-chart-swatch" style="background:${CHART_COLORS[i % CHART_COLORS.length]}"></span><span>${escapeHtml(item.label)}</span></span><span class="dads-chart-donut-val">${escapeHtml(fmtNum(val) + unit)} (${pct}%)</span></li>`;
    })
    .join('');
  return `<div class="dads-chart-donut-layout">
    <svg class="dads-chart-svg" viewBox="0 0 180 180" style="max-width:180px;margin:0 auto" role="img" aria-label="${escapeHtml(spec.title || 'ドーナツグラフ')}">
      <circle cx="90" cy="90" r="${r}" fill="none" stroke="#e8e8ee" stroke-width="24" />
      ${circles}
      <text x="90" y="86" text-anchor="middle" font-size="11" fill="#626266">${escapeHtml(spec.centerLabel || '合計')}</text>
      <text x="90" y="106" text-anchor="middle" font-size="18" font-weight="700" fill="#1a1a1c">${escapeHtml(fmtNum(total) + unit)}</text>
    </svg>
    <ul class="dads-chart-donut-list">${list}</ul>
  </div>`;
}

function renderSparklineChart(spec) {
  const vals = (spec.values || []).map((v) => Number(v) || 0);
  if (!vals.length) return '';
  const W = 160;
  const H = 40;
  const pad = 5;
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const span = maxV - minV || 1;
  const pts = vals.map((v, i) => {
    const x = vals.length === 1 ? W / 2 : pad + (i / (vals.length - 1)) * (W - pad * 2);
    const y = H - pad - ((v - minV) / span) * (H - pad * 2);
    return [x, y];
  });
  const poly = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const [lx, ly] = pts[pts.length - 1];
  return `<svg class="dads-chart-svg" viewBox="0 0 ${W} ${H}" style="max-width:160px" role="img" aria-label="${escapeHtml(spec.ariaLabel || '推移スパークライン')}">
    <polyline fill="none" stroke="var(--dads-chart-1)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${poly}" />
    <circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="3.5" fill="var(--dads-chart-1)" />
  </svg>`;
}

function renderScatterChart(spec) {
  const pts = spec.points || [];
  const xMax = Number(spec.xMax) || niceMax(Math.max(1, ...pts.map((p) => Number(p.x) || 0)));
  const yMax = Number(spec.yMax) || niceMax(Math.max(1, ...pts.map((p) => Number(p.y) || 0)));
  const W = 560;
  const H = 280;
  const pad = { top: 24, right: 24, bottom: 38, left: 48 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;
  const midX = pad.left + plotW / 2;
  const midY = pad.top + plotH / 2;
  const q = spec.quadrants || [];
  const quadLabels =
    q.length === 4
      ? `<text x="${W - pad.right - 6}" y="${pad.top + 16}" text-anchor="end" font-size="11" font-weight="700" fill="#626266">${escapeHtml(q[0])}</text>
         <text x="${pad.left + 6}" y="${pad.top + 16}" font-size="11" font-weight="700" fill="#626266">${escapeHtml(q[1])}</text>
         <text x="${pad.left + 6}" y="${H - pad.bottom - 8}" font-size="11" font-weight="700" fill="#626266">${escapeHtml(q[2])}</text>
         <text x="${W - pad.right - 6}" y="${H - pad.bottom - 8}" text-anchor="end" font-size="11" font-weight="700" fill="#626266">${escapeHtml(q[3])}</text>`
      : '';
  const dots = pts
    .map((p) => {
      const cx = pad.left + ((Number(p.x) || 0) / xMax) * plotW;
      const cy = pad.top + plotH - ((Number(p.y) || 0) / yMax) * plotH;
      const fill = p.highlight ? 'var(--dads-chart-1)' : 'var(--dads-chart-2)';
      return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${p.highlight ? '7' : '5.5'}" fill="${fill}" stroke="#ffffff" stroke-width="2" />
        <text x="${(cx + 9).toFixed(1)}" y="${(cy + 4).toFixed(1)}" font-size="11.5" font-weight="${p.highlight ? '700' : '500'}" fill="#1a1a1c">${escapeHtml(p.label)}</text>`;
    })
    .join('');
  return `<div class="dads-chart-svg-wrap"><svg class="dads-chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeHtml(spec.title || '散布図')}">
    <rect x="${pad.left}" y="${pad.top}" width="${plotW}" height="${plotH}" fill="#ffffff" stroke="#d5d5dc" stroke-width="1" rx="6" />
    <line x1="${midX}" y1="${pad.top}" x2="${midX}" y2="${H - pad.bottom}" stroke="#d5d5dc" stroke-dasharray="4 4" />
    <line x1="${pad.left}" y1="${midY}" x2="${W - pad.right}" y2="${midY}" stroke="#d5d5dc" stroke-dasharray="4 4" />
    ${quadLabels}
    ${dots}
    ${spec.xLabel ? `<text x="${midX}" y="${H - 8}" text-anchor="middle" font-size="12" font-weight="600" fill="#4a4a4f">${escapeHtml(spec.xLabel)}</text>` : ''}
    ${spec.yLabel ? `<text x="14" y="${midY}" text-anchor="middle" font-size="12" font-weight="600" fill="#4a4a4f" transform="rotate(-90 14 ${midY})">${escapeHtml(spec.yLabel)}</text>` : ''}
  </svg></div>`;
}

function expandDeclarativeCharts(html) {
  const re = /<div\b([^>]*\bdata-chart="([a-z]+)"[^>]*)>\s*<script\s+type="application\/json">([\s\S]*?)<\/script>\s*<\/div>/g;
  return html.replace(re, (full, attrs, kind, rawJson) => {
    let spec;
    try {
      spec = JSON.parse(rawJson.trim());
    } catch (err) {
      console.warn(`[chart] Invalid JSON in data-chart="${kind}": ${err.message}`);
      return full;
    }
    let body = '';
    if (kind === 'hbar') body = renderHbarChart(spec);
    else if (kind === 'bar') body = renderBarChart(spec);
    else if (kind === 'stacked') body = renderStackedChart(spec);
    else if (kind === 'line') body = renderLineChart(spec);
    else if (kind === 'donut') body = renderDonutChart(spec);
    else if (kind === 'sparkline') body = renderSparklineChart(spec);
    else if (kind === 'scatter') body = renderScatterChart(spec);
    else return full;
    const note = spec.note ? `<p class="dads-chart-note">${escapeHtml(spec.note)}</p>` : '';
    return `<div${attrs}>${chartHead(spec)}${body}${note}</div>`;
  });
}

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
  const vizCssPath =
    root.mode === 'skill'
      ? path.join(root.dir, 'dads-viz.css')
      : path.join(root.dir, 'src', 'dads-viz.css');
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
  const vizCss = fs.existsSync(vizCssPath) ? fs.readFileSync(vizCssPath, 'utf8') : '';
  const typeCss = fs.readFileSync(typeCssPath, 'utf8');
  const themeCss = args.theme ? fs.readFileSync(args.theme, 'utf8') : '';
  const rawBodyHtml = fs.readFileSync(args.input, 'utf8');
  const bodyHtml = expandDeclarativeCharts(rawBodyHtml);
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
        componentCssBlocks.push(`/* DADS component: ${comp.name}/${cssFile} */\n${fs.readFileSync(full, 'utf8')}`);
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
  if (bodyHtml.includes('dads-walkthrough')) scripts.push(WALKTHROUGH_RUNTIME_JS);
  if (extraJs) scripts.push(extraJs);

  const html = `<!doctype html>
<html lang="${escapeHtml(args.lang)}" data-palette="${escapeHtml(args.palette)}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(args.title)}</title>
    <style>
/* @digital-go-jp/design-tokens@2.1.0 (MIT) */
${officialTokensCss}
${semanticCss}
${vizCss}
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
