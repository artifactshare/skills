#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function bundle(skillName, args) {
  const bundler = path.join(rootDir, 'skills', skillName, 'scripts', 'bundle.mjs');
  execFileSync('node', [bundler, ...args], { stdio: 'inherit' });
}

bundle('dads-doc', [
  '--type',
  'doc',
  '--palette',
  'blue',
  '--title',
  '社内ドキュメント全文検索基盤の選定',
  '--input',
  path.join(rootDir, 'samples', 'doc', 'body-doc.html'),
  '--output',
  path.join(rootDir, 'samples', 'doc', 'sample-doc.html'),
]);

bundle('dads-dashboard', [
  '--type',
  'dashboard',
  '--palette',
  'green',
  '--title',
  'プロダクト活用・グロース進捗ダッシュボード',
  '--input',
  path.join(rootDir, 'samples', 'dashboard', 'body-dashboard.html'),
  '--script',
  path.join(rootDir, 'samples', 'dashboard', 'dashboard-filter.js'),
  '--output',
  path.join(rootDir, 'samples', 'dashboard', 'sample-dashboard.html'),
]);

bundle('dads-slides', [
  '--type',
  'slides',
  '--palette',
  'blue',
  '--title',
  'AI エージェントが作る社内資料を、デザインシステムで統一する',
  '--input',
  path.join(rootDir, 'samples', 'slides', 'body-slides.html'),
  '--output',
  path.join(rootDir, 'samples', 'slides', 'sample-slides.html'),
]);

bundle('dads-mockup', [
  '--type',
  'mockup',
  '--palette',
  'blue',
  '--title',
  '社内 AI ツール・予算申請ポータル（UI モック）',
  '--input',
  path.join(rootDir, 'samples', 'mockup', 'body-mockup.html'),
  '--script',
  path.join(rootDir, 'samples', 'mockup', 'mockup-behavior.js'),
  '--output',
  path.join(rootDir, 'samples', 'mockup', 'sample-mockup.html'),
]);
