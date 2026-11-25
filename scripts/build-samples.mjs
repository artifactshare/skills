#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function bundle(skillName, args) {
  const bundler = path.join(rootDir, 'skills', skillName, 'scripts', 'bundle.mjs');
  execFileSync('node', [bundler, ...args], { stdio: 'inherit' });
}

const docOut = path.join(rootDir, 'samples', 'doc', 'sample-doc.html');
const prReviewOut = path.join(rootDir, 'samples', 'doc', 'sample-pr-review.html');
const policyOut = path.join(rootDir, 'samples', 'doc', 'sample-policy-guide.html');
const dashOut = path.join(rootDir, 'samples', 'dashboard', 'sample-dashboard.html');
const slidesOut = path.join(rootDir, 'samples', 'slides', 'sample-slides.html');
const bizSlidesOut = path.join(rootDir, 'samples', 'slides', 'sample-biz-slides.html');
const mockupOut = path.join(rootDir, 'samples', 'mockup', 'sample-mockup.html');

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
  docOut,
]);

bundle('dads-doc', [
  '--type',
  'doc',
  '--palette',
  'blue',
  '--title',
  'PR #418 レビューガイド：決済 Webhook リトライと冪等性キーの導入',
  '--input',
  path.join(rootDir, 'samples', 'doc', 'body-pr-review.html'),
  '--output',
  prReviewOut,
]);

bundle('dads-doc', [
  '--type',
  'doc',
  '--palette',
  'blue',
  '--title',
  '生成 AI ツール利用ガイドライン（2026 年改訂版）',
  '--input',
  path.join(rootDir, 'samples', 'doc', 'body-policy-guide.html'),
  '--output',
  policyOut,
]);

bundle('dads-dashboard', [
  '--type',
  'dashboard',
  '--palette',
  'blue',
  '--title',
  'プロダクト活用・グロース進捗ダッシュボード',
  '--input',
  path.join(rootDir, 'samples', 'dashboard', 'body-dashboard.html'),
  '--script',
  path.join(rootDir, 'samples', 'dashboard', 'dashboard-filter.js'),
  '--output',
  dashOut,
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
  slidesOut,
]);

bundle('dads-slides', [
  '--type',
  'slides',
  '--palette',
  'blue',
  '--title',
  'Q4 事業振り返りと Q1 重点施策のご提案',
  '--input',
  path.join(rootDir, 'samples', 'slides', 'body-biz-slides.html'),
  '--output',
  bizSlidesOut,
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
  mockupOut,
]);

// Assemble single-URL static site showcase (ready for `as upload samples/showcase/dist`)
const showcaseDist = path.join(rootDir, 'samples', 'showcase', 'dist');
fs.mkdirSync(showcaseDist, { recursive: true });
fs.copyFileSync(docOut, path.join(showcaseDist, 'doc.html'));
fs.copyFileSync(prReviewOut, path.join(showcaseDist, 'pr-review.html'));
fs.copyFileSync(policyOut, path.join(showcaseDist, 'policy-guide.html'));
fs.copyFileSync(dashOut, path.join(showcaseDist, 'dashboard.html'));
fs.copyFileSync(slidesOut, path.join(showcaseDist, 'slides.html'));
fs.copyFileSync(bizSlidesOut, path.join(showcaseDist, 'biz-slides.html'));
fs.copyFileSync(mockupOut, path.join(showcaseDist, 'mockup.html'));

bundle('dads-mockup', [
  '--type',
  'mockup',
  '--palette',
  'blue',
  '--title',
  'Artifact Share Agent Skills — DADS ライブショーケース',
  '--input',
  path.join(rootDir, 'samples', 'showcase', 'body-showcase.html'),
  '--script',
  path.join(rootDir, 'samples', 'showcase', 'showcase.js'),
  '--output',
  path.join(showcaseDist, 'index.html'),
]);
