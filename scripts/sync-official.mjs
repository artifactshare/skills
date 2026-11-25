#!/usr/bin/env node
/**
 * Sync official Digital Agency assets into vendor/:
 * 1. @digital-go-jp/design-tokens@2.1.0 (npm tarball)
 * 2. digital-go-jp/design-system-example-components-html (all 41 components: CSS, JS, MD, LICENSE)
 * 3. digital-go-jp/policy-dashboard-assets (7 official 2026 dashboard theme JSONs)
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const vendorDir = path.join(rootDir, 'vendor');

const TOKENS_VERSION = '2.1.0';
const TOKENS_TARBALL = `https://registry.npmjs.org/@digital-go-jp/design-tokens/-/design-tokens-${TOKENS_VERSION}.tgz`;
const COMPONENTS_TARBALL =
  'https://codeload.github.com/digital-go-jp/design-system-example-components-html/tar.gz/refs/heads/main';
const DASHBOARD_THEMES = [
  'CustomThemeBlueDefault_2026.json',
  'CustomThemeCyanDefault_2026.json',
  'CustomThemeGreenDefault_2026.json',
  'CustomThemeLightBlueDefault_2026.json',
  'CustomThemeOrangeDefault_2026.json',
  'CustomThemeRedDefault_2026.json',
  'CustomThemeSolidGrayDefault_2026.json',
];

function downloadAndExtract(url, destDir, strip = 1) {
  fs.rmSync(destDir, { recursive: true, force: true });
  fs.mkdirSync(destDir, { recursive: true });
  const tmpFile = path.join(os.tmpdir(), `dads-sync-${Date.now()}-${Math.random().toString(36).slice(2)}.tgz`);
  try {
    execFileSync('curl', ['-fsSL', url, '-o', tmpFile], { stdio: 'inherit' });
    execFileSync('tar', ['-xzf', tmpFile, `--strip-components=${strip}`, '-C', destDir], {
      stdio: 'inherit',
    });
  } finally {
    fs.rmSync(tmpFile, { force: true });
  }
}

function syncTokens() {
  console.log(`[1/3] Syncing @digital-go-jp/design-tokens@${TOKENS_VERSION}...`);
  const tmpDir = path.join(os.tmpdir(), `dads-tokens-${Date.now()}`);
  downloadAndExtract(TOKENS_TARBALL, tmpDir, 1);
  const outDir = path.join(vendorDir, 'dads-design-tokens');
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(path.join(outDir, 'dist'), { recursive: true });
  fs.copyFileSync(path.join(tmpDir, 'LICENSE'), path.join(outDir, 'LICENSE'));
  fs.copyFileSync(path.join(tmpDir, 'package.json'), path.join(outDir, 'package.json'));
  fs.copyFileSync(path.join(tmpDir, 'dist', 'tokens.css'), path.join(outDir, 'dist', 'tokens.css'));
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

function syncComponents() {
  console.log('[2/3] Syncing digital-go-jp/design-system-example-components-html (all components)...');
  const tmpDir = path.join(os.tmpdir(), `dads-components-${Date.now()}`);
  downloadAndExtract(COMPONENTS_TARBALL, tmpDir, 1);

  const outDir = path.join(vendorDir, 'dads-components');
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  if (fs.existsSync(path.join(tmpDir, 'LICENSE'))) {
    fs.copyFileSync(path.join(tmpDir, 'LICENSE'), path.join(outDir, 'LICENSE'));
  }

  const srcComponentsDir = path.join(tmpDir, 'src', 'components');
  const manifest = [];

  for (const entry of fs.readdirSync(srcComponentsDir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isDirectory()) continue;
    const compName = entry.name;
    const srcDir = path.join(srcComponentsDir, compName);
    const destCompDir = path.join(outDir, compName);
    fs.mkdirSync(destCompDir, { recursive: true });

    const cssFiles = [];
    const jsFiles = [];
    const mdFiles = [];

    for (const file of fs.readdirSync(srcDir).sort()) {
      if (file.endsWith('.test.js') || file.endsWith('.vrt.js') || file.endsWith('.stories.ts')) {
        continue;
      }
      if (file.endsWith('.css')) {
        fs.copyFileSync(path.join(srcDir, file), path.join(destCompDir, file));
        cssFiles.push(file);
      } else if (file.endsWith('.js')) {
        fs.copyFileSync(path.join(srcDir, file), path.join(destCompDir, file));
        jsFiles.push(file);
      } else if (file.endsWith('.md')) {
        fs.copyFileSync(path.join(srcDir, file), path.join(destCompDir, file));
        mdFiles.push(file);
      }
    }

    // Extract own .dads-<compName>* class prefixes for precise tree-shaking
    const ownPrefix = `dads-${compName}`;
    const classTokens = new Set();
    for (const cssFile of cssFiles) {
      const css = fs.readFileSync(path.join(destCompDir, cssFile), 'utf8');
      for (const m of css.matchAll(/\.(dads-[a-z0-9-]+)/g)) {
        const cls = m[1];
        if (cls === ownPrefix || cls.startsWith(`${ownPrefix}-`) || cls.startsWith(`${ownPrefix}_`)) {
          classTokens.add(cls);
        }
      }
    }
    if (classTokens.size === 0) {
      classTokens.add(ownPrefix);
    }

    manifest.push({
      name: compName,
      css: cssFiles,
      js: jsFiles,
      md: mdFiles,
      classes: Array.from(classTokens).sort(),
    });
  }

  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  fs.rmSync(tmpDir, { recursive: true, force: true });
  console.log(`Synced ${manifest.length} official DADS components.`);
}

function syncDashboardThemes() {
  console.log('[3/3] Syncing digital-go-jp/policy-dashboard-assets (7 themes, 2026)...');
  const outDir = path.join(vendorDir, 'policy-dashboard-themes');
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const summary = {};
  for (const file of DASHBOARD_THEMES) {
    const url = `https://raw.githubusercontent.com/digital-go-jp/policy-dashboard-assets/main/powerbi-templates/powerbi-theme-json/${file}`;
    const dest = path.join(outDir, file);
    execFileSync('curl', ['-fsSL', url, '-o', dest], { stdio: 'inherit' });
    const parsed = JSON.parse(fs.readFileSync(dest, 'utf8'));
    const key = file
      .replace('CustomTheme', '')
      .replace('Default_2026.json', '')
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();
    summary[key] = {
      name: parsed.name,
      dataColors: parsed.dataColors,
      kpiStatus: {
        good: parsed.visualStyles?.kpi?.['*']?.status?.[0]?.goodColor?.solid?.color ?? null,
        neutral: parsed.visualStyles?.kpi?.['*']?.status?.[0]?.neutralColor?.solid?.color ?? null,
        bad: parsed.visualStyles?.kpi?.['*']?.status?.[0]?.badColor?.solid?.color ?? null,
      },
    };
  }
  fs.writeFileSync(path.join(outDir, 'palettes.summary.json'), JSON.stringify(summary, null, 2) + '\n');
}

syncTokens();
syncComponents();
syncDashboardThemes();
console.log('Done.');
