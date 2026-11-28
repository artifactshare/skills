#!/usr/bin/env node
/**
 * Build self-contained portable skill packages under skills/<name>/
 * from src/ and vendor/, generate per-skill references/components-catalog.md,
 * and validate SKILL.md frontmatter + internal links.
 *
 * Usage:
 *   node scripts/build-skills.mjs          # build/sync all skills
 *   node scripts/build-skills.mjs --check  # verify no drift & validate metadata
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const checkMode = process.argv.includes('--check');

const SKILLS = [
  { name: 'dads', types: ['doc', 'dashboard', 'slides', 'mockup'] },
];

const drifts = [];

function syncFile(srcPath, destPath) {
  const srcContent = fs.readFileSync(srcPath);
  if (checkMode) {
    if (!fs.existsSync(destPath) || !fs.readFileSync(destPath).equals(srcContent)) {
      drifts.push(path.relative(rootDir, destPath));
    }
    return;
  }
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, srcContent);
}

function syncText(content, destPath) {
  const buf = Buffer.from(content, 'utf8');
  if (checkMode) {
    if (!fs.existsSync(destPath) || !fs.readFileSync(destPath).equals(buf)) {
      drifts.push(path.relative(rootDir, destPath));
    }
    return;
  }
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, buf);
}

function generateCatalogMarkdown(manifest) {
  const lines = [
    '# DADS Component Catalog (Auto-generated)',
    '',
    'Below are all 43 components from `digital-go-jp/design-system-example-components-html` (MIT).',
    'Any `.dads-*` class used in your body HTML is automatically detected and tree-shaken into the single HTML output by `scripts/bundle.mjs`.',
    '',
    '| Component | Primary CSS Classes |',
    '|---|---|',
  ];
  for (const comp of manifest) {
    const sampleClasses = comp.classes.slice(0, 4).map((c) => `\`.${c}\``).join(', ');
    lines.push(`| \`${comp.name}\` | ${sampleClasses || '—'} |`);
  }
  lines.push('');
  return lines.join('\n');
}

function validateSkillMd(skillDir, expectedName) {
  const skillMdPath = path.join(skillDir, 'SKILL.md');
  if (!fs.existsSync(skillMdPath)) {
    throw new Error(`Missing SKILL.md in ${skillDir}`);
  }
  const text = fs.readFileSync(skillMdPath, 'utf8');
  const fmMatch = text.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) {
    throw new Error(`Missing YAML frontmatter in ${skillMdPath}`);
  }
  const fm = fmMatch[1];
  const nameMatch = fm.match(/^name:\s*([a-z0-9-]+)\s*$/m);
  if (!nameMatch || nameMatch[1] !== expectedName) {
    throw new Error(`Frontmatter name mismatch in ${skillMdPath}: expected ${expectedName}`);
  }
  const descMatch = fm.match(/^description:\s*(.+)$/m);
  if (!descMatch || descMatch[1].trim().length < 20) {
    throw new Error(`Frontmatter description too short in ${skillMdPath}`);
  }
  // Check relative markdown links
  for (const m of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const href = m[1];
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('#')) {
      continue;
    }
    const target = path.resolve(skillDir, href);
    if (!fs.existsSync(target)) {
      throw new Error(`Broken relative link in ${skillMdPath}: ${href}`);
    }
  }
}

function main() {
  const tokensPath = path.join(rootDir, 'vendor', 'dads-design-tokens', 'dist', 'tokens.css');
  const semanticPath = path.join(rootDir, 'src', 'dads-semantic.css');
  const bundlerPath = path.join(rootDir, 'src', 'bundle.mjs');
  const componentsSrcDir = path.join(rootDir, 'vendor', 'dads-components');
  const manifestPath = path.join(componentsSrcDir, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const catalogMd = generateCatalogMarkdown(manifest);

  for (const skill of SKILLS) {
    const skillDir = path.join(rootDir, 'skills', skill.name);
    syncFile(bundlerPath, path.join(skillDir, 'scripts', 'bundle.mjs'));
    syncFile(tokensPath, path.join(skillDir, 'assets', 'tokens.css'));
    syncFile(semanticPath, path.join(skillDir, 'assets', 'dads-semantic.css'));
    for (const type of skill.types) {
      syncFile(
        path.join(rootDir, 'src', 'types', `${type}.css`),
        path.join(skillDir, 'assets', `type-${type}.css`),
      );
    }
    syncFile(manifestPath, path.join(skillDir, 'assets', 'components', 'manifest.json'));
    for (const comp of manifest) {
      for (const cssFile of comp.css) {
        syncFile(
          path.join(componentsSrcDir, comp.name, cssFile),
          path.join(skillDir, 'assets', 'components', comp.name, cssFile),
        );
      }
    }
    syncText(catalogMd, path.join(skillDir, 'references', 'components-catalog.md'));
    syncFile(
      path.join(rootDir, 'src', 'references', 'component-snippets.md'),
      path.join(skillDir, 'references', 'component-snippets.md'),
    );
  }

  if (checkMode && drifts.length > 0) {
    console.error(`Skill package drift detected (${drifts.length} files):`);
    for (const d of drifts.slice(0, 20)) console.error(`  - ${d}`);
    console.error('Run `npm run build:skills` to synchronize.');
    process.exit(1);
  }

  for (const skill of SKILLS) {
    validateSkillMd(path.join(rootDir, 'skills', skill.name), skill.name);
  }

  console.log(
    checkMode
      ? `Validated ${SKILLS.length} standalone skill packages (0 drift, all frontmatter & links OK).`
      : `Built ${SKILLS.length} standalone skill packages (each with ${manifest.length} official DADS components).`,
  );
}

main();
