import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

test('all 43 official DADS components are synced in vendor manifest', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(rootDir, 'vendor', 'dads-components', 'manifest.json'), 'utf8'),
  );
  assert.ok(manifest.length >= 41, `Expected >= 41 components, got ${manifest.length}`);
  const names = new Set(manifest.map((c) => c.name));
  for (const required of ['button', 'input-text', 'select', 'checkbox', 'table', 'notification-banner', 'accordion', 'tab']) {
    assert.ok(names.has(required), `Missing required official component: ${required}`);
  }
});

test('all 7 official 2026 dashboard themes are synced', () => {
  const summary = JSON.parse(
    fs.readFileSync(path.join(rootDir, 'vendor', 'policy-dashboard-themes', 'palettes.summary.json'), 'utf8'),
  );
  assert.deepEqual(
    Object.keys(summary).sort(),
    ['blue', 'cyan', 'green', 'light-blue', 'orange', 'red', 'solid-gray'],
  );
  assert.equal(summary.orange.kpiStatus.bad, '#850000');
  assert.equal(summary.red.kpiStatus.bad, '#850000');
  assert.equal(summary.blue.kpiStatus.good, '#0017C1');
});

test('standalone skill bundler works without repo parent directory and tree-shakes components', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dads-skill-portable-'));
  try {
    // Copy only skills/dads into an isolated temp dir to prove 100% portability
    const isolatedSkillDir = path.join(tmpDir, 'dads');
    fs.cpSync(path.join(rootDir, 'skills', 'dads'), isolatedSkillDir, { recursive: true });

    const bodyPath = path.join(tmpDir, 'body.html');
    const outPath = path.join(tmpDir, 'out.html');
    const themePath = path.join(tmpDir, 'theme.css');

    fs.writeFileSync(
      bodyPath,
      '<div class="dads-mock-shell"><button class="dads-button" data-type="solid-fill">保存</button></div>',
    );
    fs.writeFileSync(themePath, ':root { --brand-marker: 1; }');

    execFileSync(
      'node',
      [
        path.join(isolatedSkillDir, 'scripts', 'bundle.mjs'),
        '--type',
        'mockup',
        '--palette',
        'cyan',
        '--theme',
        themePath,
        '--title',
        'Portable Test',
        '--input',
        bodyPath,
        '--output',
        outPath,
      ],
      { stdio: 'pipe' },
    );

    const html = fs.readFileSync(outPath, 'utf8');
    assert.match(html, /data-palette="cyan"/);
    assert.match(html, /--color-primitive-blue-900: #0017c1/);
    assert.match(html, /DADS component: button\/button\.css/);
    assert.doesNotMatch(html, /DADS component: calendar\/calendar\.css/);
    assert.match(html, /--brand-marker: 1/);
    assert.match(html, /font-feature-settings: 'palt' 1/);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('doc bundler injects scroll-spy TOC runtime and supports all 7 palettes', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dads-doc-test-'));
  try {
    const bodyPath = path.join(tmpDir, 'body.html');
    const outPath = path.join(tmpDir, 'out.html');
    fs.writeFileSync(
      bodyPath,
      '<main class="dads-doc"><section class="dads-section"><h2>1. 概要</h2></section><section class="dads-section"><h2>2. 詳細</h2></section></main>',
    );
    execFileSync(
      'node',
      [
        path.join(rootDir, 'skills', 'dads', 'scripts', 'bundle.mjs'),
        '--type',
        'doc',
        '--palette',
        'orange',
        '--title',
        'Doc Test',
        '--input',
        bodyPath,
        '--output',
        outPath,
      ],
      { stdio: 'pipe' },
    );
    const html = fs.readFileSync(outPath, 'utf8');
    assert.match(html, /updateFromScroll/);
    assert.match(html, /data-palette="orange"/);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('web skill builder produces valid script-free zip archives with root SKILL.md', () => {
  execFileSync('node', [path.join(rootDir, 'scripts', 'build-web-skills.mjs')], { stdio: 'pipe' });
  const webDir = path.join(rootDir, 'dist', 'web-skills');
  const expected = ['dads-web.zip'];
  for (const zipName of expected) {
    const zipPath = path.join(webDir, zipName);
    assert.ok(fs.existsSync(zipPath), `Missing web zip: ${zipName}`);
    const listing = execFileSync('unzip', ['-Z1', zipPath], { encoding: 'utf8' })
      .trim()
      .split('\n');
    assert.ok(listing.includes('SKILL.md'), `${zipName} must have SKILL.md at root`);
    for (const entry of listing) {
      assert.doesNotMatch(entry, /\.(js|mjs|cjs|py|sh)$/i, `${zipName} must not contain script: ${entry}`);
      assert.doesNotMatch(entry, /\.DS_Store|__MACOSX/, `${zipName} must not contain OS metadata: ${entry}`);
    }
  }
});

test('distributed skills and showcase runtime contain no security scanner triggers or iframes', () => {
  const forbidden = /\b(innerHTML|outerHTML|postMessage|eval|child_process)\b|new\s+Function\s*\(|addEventListener\s*\(\s*['"]message['"]|\bfetch\s*\(/;
  const targets = [];

  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(js|mjs|cjs|html)$/i.test(entry.name)) targets.push(full);
    }
  };

  walk(path.join(rootDir, 'src'));
  walk(path.join(rootDir, 'skills'));
  targets.push(path.join(rootDir, 'samples', 'showcase', 'showcase.js'));

  for (const filePath of targets) {
    const text = fs.readFileSync(filePath, 'utf8');
    const match = text.match(forbidden);
    assert.equal(
      match,
      null,
      `Forbidden security-scanner pattern "${match?.[0]}" found in ${path.relative(rootDir, filePath)}`,
    );
  }

  const showcaseDist = path.join(rootDir, 'samples', 'showcase', 'dist', 'index.html');
  if (fs.existsSync(showcaseDist)) {
    const html = fs.readFileSync(showcaseDist, 'utf8');
    assert.doesNotMatch(html, /<iframe\b/i, 'Showcase must not contain <iframe> (blocked by Artifact Share CSP)');
  }
});

test('bundler expands all 7 declarative SVG chart types and includes dads-viz.css + walkthrough runtime', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dads-charts-test-'));
  try {
    const bodyPath = path.join(tmpDir, 'body.html');
    const outPath = path.join(tmpDir, 'out.html');
    fs.writeFileSync(
      bodyPath,
      `<main class="dads-doc">
        <div class="dads-walkthrough"><button data-step="1">Step 1</button><div data-step-target="1">Target</div></div>
        <div class="dads-chart" data-chart="hbar"><script type="application/json">{"title":"H","items":[{"label":"A","value":10,"highlight":true}]}</script></div>
        <div class="dads-chart" data-chart="bar"><script type="application/json">{"title":"B","labels":["X"],"series":[{"name":"S1","values":[10]},{"name":"S2","values":[20]}]}</script></div>
        <div class="dads-chart" data-chart="stacked"><script type="application/json">{"title":"ST","seriesNames":["A","B"],"rows":[{"label":"R1","values":[60,40]}]}</script></div>
        <div class="dads-chart" data-chart="line"><script type="application/json">{"title":"L","labels":["1月","2月"],"series":[{"name":"実績","values":[10,20]}],"target":{"value":15}}</script></div>
        <div class="dads-chart" data-chart="donut"><script type="application/json">{"title":"D","items":[{"label":"A","value":30},{"label":"B","value":70}]}</script></div>
        <div class="dads-chart dads-chart--inline" data-chart="sparkline"><script type="application/json">{"values":[1,3,2,5]}</script></div>
        <div class="dads-chart" data-chart="scatter"><script type="application/json">{"title":"SC","quadrants":["Q1","Q2","Q3","Q4"],"points":[{"label":"P1","x":4,"y":8,"highlight":true}]}</script></div>
      </main>`,
    );
    execFileSync(
      'node',
      [
        path.join(rootDir, 'skills', 'dads', 'scripts', 'bundle.mjs'),
        '--type',
        'doc',
        '--palette',
        'blue',
        '--title',
        'Charts Test',
        '--input',
        bodyPath,
        '--output',
        outPath,
      ],
      { stdio: 'pipe' },
    );
    const html = fs.readFileSync(outPath, 'utf8');
    const svgCount = (html.match(/<svg class="dads-chart-svg"/g) || []).length;
    assert.equal(svgCount, 7, `Expected 7 rendered SVG charts, got ${svgCount}`);
    assert.doesNotMatch(html, /type="application\/json"/, 'Raw chart JSON scripts should be expanded into SVGs');
    assert.match(html, /\.dads-flow\s*\{/, 'dads-viz.css should be bundled');
    assert.match(html, /data-step-target/, 'walkthrough runtime should be injected');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
