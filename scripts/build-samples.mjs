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

bundle('dads-kpi-dashboard', [
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

// Assemble single-page (no-iframe, CSP-safe) showcase in samples/showcase/dist/index.html
const showcaseDist = path.join(rootDir, 'samples', 'showcase', 'dist');
fs.rmSync(showcaseDist, { recursive: true, force: true });
fs.mkdirSync(showcaseDist, { recursive: true });

const read = (rel) => fs.readFileSync(path.join(rootDir, rel), 'utf8');
const dashBody = read('samples/dashboard/body-dashboard.html');
const policyBody = read('samples/doc/body-policy-guide.html');
const bizSlidesBody = read('samples/slides/body-biz-slides.html');
const prReviewBody = read('samples/doc/body-pr-review.html');
const mockupBody = read('samples/mockup/body-mockup.html');
const techSlidesBody = read('samples/slides/body-slides.html');

const combinedBody = `<div
  class="dads-mock-shell showcase-shell"
  style="height: 100dvh; overflow: hidden; display: flex; flex-direction: column; background: var(--color-neutral-white)"
>
  <header
    class="dads-mock-topbar showcase-header"
    style="padding: 10px 20px; border-bottom: 1px solid var(--color-neutral-solid-gray-200); flex-shrink: 0"
  >
    <div class="dads-mock-brand" style="font-size: var(--font-size-16)">
      <span>Artifact Share Agent Skills</span>
      <span class="dads-badge dads-badge--primary showcase-brand-badge">デジタル庁デザインシステム準拠</span>
    </div>
    <div class="showcase-header-actions" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap">
      <button type="button" class="dads-button" data-size="xs" data-type="solid-fill" id="open-install-btn">
        スキルを導入
      </button>
      <a class="dads-button" data-size="xs" data-type="outline" href="https://github.com/artifactshare/skills" target="_blank" rel="noopener">
        GitHub
      </a>
    </div>
  </header>

  <dialog id="install-dialog" class="showcase-dialog" aria-labelledby="install-dialog-title">
    <div class="showcase-dialog-head">
      <div>
        <h2 id="install-dialog-title" style="margin: 0; font-size: var(--font-size-22); color: var(--color-neutral-black)">
          スキルの導入方法
        </h2>
        <p style="margin: 4px 0 0; font-size: var(--font-size-14); color: var(--color-neutral-solid-gray-600)">
          お使いの AI ツールに合わせて選んでください。すべて無料です。
        </p>
      </div>
      <button type="button" class="dads-button" data-size="xs" data-type="outline" id="close-install-btn" aria-label="閉じる">
        閉じる
      </button>
    </div>

    <div class="showcase-dialog-body">
      <section class="showcase-dialog-card">
        <p style="margin: 0 0 6px; font-size: var(--font-size-16); font-weight: 700; color: var(--color-neutral-black)">
          Claude Code / Codex / Cursor / GitHub Copilot / Gemini CLI
        </p>
        <p style="margin: 0 0 10px; font-size: var(--font-size-14); color: var(--color-neutral-solid-gray-700)">
          以下のコマンドを AI ツールに実行してもらい、再起動すると使えるようになります。
        </p>
        <div class="showcase-cmd-row">
          <code id="install-cmd" class="showcase-cmd-box">npx skills add artifactshare/skills</code>
          <button type="button" class="dads-button" data-size="xs" data-type="solid-fill" id="copy-install-btn">
            コピー
          </button>
        </div>
      </section>

      <section class="showcase-dialog-card">
        <p style="margin: 0 0 6px; font-size: var(--font-size-16); font-weight: 700; color: var(--color-neutral-black)">
          Gemini / Claude.ai（Web 版）
        </p>
        <p style="margin: 0 0 10px; font-size: var(--font-size-14); color: var(--color-neutral-solid-gray-700)">
          パッケージをダウンロードしてアップロードするだけで使えます。
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px">
          <a
            class="dads-button"
            data-size="xs"
            data-type="solid-fill"
            href="https://github.com/artifactshare/skills/releases/latest/download/dads-all-in-one-web.zip"
            target="_blank"
            rel="noopener"
          >
            スキルパック (.zip) をダウンロード
          </a>
          <a
            class="dads-button"
            data-size="xs"
            data-type="outline"
            href="https://github.com/artifactshare/skills/releases/latest"
            target="_blank"
            rel="noopener"
          >
            個別に選ぶ
          </a>
        </div>
        <ul style="margin: 0; padding-left: 18px; font-size: var(--font-size-14); color: var(--color-neutral-solid-gray-700); line-height: 1.6">
          <li><strong>Gemini</strong>: 左メニュー「カスタマイズ」から「Skills」を開き、.zip をアップロードします。生成した HTML は Canvas でそのまま確認できます。</li>
          <li><strong>Claude.ai</strong>: Projects または Skills にアップロードします。</li>
        </ul>
      </section>

      <section class="showcase-dialog-card" style="background: var(--color-key-50); border-color: var(--color-key-200)">
        <p style="margin: 0 0 6px; font-size: var(--font-size-14); font-weight: 700; color: var(--color-key-900)">
          使い方の例
        </p>
        <ul style="margin: 0; padding-left: 18px; font-size: var(--font-size-14); color: var(--color-neutral-solid-gray-800); line-height: 1.6">
          <li>「この議事録を DADS でドキュメントにして」</li>
          <li>「この CSV から DADS で KPI ダッシュボードを作って」</li>
          <li>「この企画書を DADS で 5 枚のスライドにまとめて」</li>
        </ul>
      </section>
    </div>
  </dialog>

  <div
    class="showcase-toolbar"
    style="
      flex-shrink: 0;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px 16px;
      background: #f1f1f4;
      padding: 8px 20px;
      border-bottom: 1px solid var(--color-neutral-solid-gray-200);
    "
  >
    <div class="showcase-demo-row" style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px" role="group" aria-label="デモ切替">
      <div class="showcase-demo-group" style="display: inline-flex; flex-wrap: wrap; align-items: center; gap: 6px">
        <span class="showcase-group-label" style="font-size: var(--font-size-14); font-weight: 700; color: var(--color-neutral-solid-gray-600)">ビジネス:</span>
        <button type="button" class="dads-button" data-size="xs" data-type="solid-fill" data-demo="dashboard">KPI ダッシュボード</button>
        <button type="button" class="dads-button" data-size="xs" data-type="outline" data-demo="policy-guide">社内ルール・制度ガイド</button>
        <button type="button" class="dads-button" data-size="xs" data-type="outline" data-demo="biz-slides">社内 MTG スライド</button>
      </div>
      <div class="showcase-demo-group" style="display: inline-flex; flex-wrap: wrap; align-items: center; gap: 6px">
        <span class="showcase-group-label" style="font-size: var(--font-size-14); font-weight: 700; color: var(--color-neutral-solid-gray-600)">開発:</span>
        <button type="button" class="dads-button" data-size="xs" data-type="outline" data-demo="pr-review">PR レビューガイド</button>
        <button type="button" class="dads-button" data-size="xs" data-type="outline" data-demo="mockup">動く業務 UI モック</button>
        <button type="button" class="dads-button" data-size="xs" data-type="outline" data-demo="slides">技術発表スライド</button>
      </div>
    </div>

    <div class="showcase-palette-row" style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px">
      <span style="font-size: var(--font-size-14); font-weight: 700; color: var(--color-neutral-black); margin-right: 2px; flex-shrink: 0">配色:</span>
      <button type="button" class="dads-badge dads-badge--primary" data-switch-palette="blue" style="cursor: pointer; flex-shrink: 0">Blue</button>
      <button type="button" class="dads-badge" data-switch-palette="light-blue" style="cursor: pointer; flex-shrink: 0">Light Blue</button>
      <button type="button" class="dads-badge" data-switch-palette="cyan" style="cursor: pointer; flex-shrink: 0">Cyan</button>
      <button type="button" class="dads-badge" data-switch-palette="green" style="cursor: pointer; flex-shrink: 0">Green</button>
      <button type="button" class="dads-badge" data-switch-palette="orange" style="cursor: pointer; flex-shrink: 0">Orange</button>
      <button type="button" class="dads-badge" data-switch-palette="red" style="cursor: pointer; flex-shrink: 0">Red</button>
      <button type="button" class="dads-badge" data-switch-palette="solid-gray" style="cursor: pointer; flex-shrink: 0">Gray</button>
      <button type="button" id="fullscreen-btn" class="dads-button showcase-fs-trigger" data-size="xs" data-type="outline" style="margin-left: 6px; flex-shrink: 0">全画面</button>
    </div>
  </div>

  <div
    id="showcase-stage"
    style="flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; background: var(--color-neutral-white)"
  >
    <div id="showcase-context-bar" class="showcase-context-bar">
      <p class="showcase-context-text">
        <strong>デジタル庁デザインシステム準拠の資料を、AI に頼むだけで作れる無料スキルのサンプルです</strong>
      </p>
      <div class="showcase-context-actions">
        <button type="button" class="dads-button" data-size="xs" data-type="outline" id="open-about-btn">これは何？</button>
        <button type="button" class="dads-button" data-size="xs" data-type="text" id="close-context-btn" aria-label="案内を閉じる" style="min-width: auto; padding: 4px 8px">×</button>
      </div>
    </div>

    <dialog id="about-dialog" class="showcase-dialog" aria-labelledby="about-dialog-title">
      <div class="showcase-dialog-head">
        <div>
          <h2 id="about-dialog-title" style="margin: 0; font-size: var(--font-size-22); color: var(--color-neutral-black)">
            デジタル庁デザインシステム（DADS）スキルパック
          </h2>
          <p style="margin: 4px 0 0; font-size: var(--font-size-14); color: var(--color-neutral-solid-gray-600)">
            AI が作る資料を、そのまま会議や社内共有に出せる見た目へ揃える無料スキルです。
          </p>
        </div>
        <button type="button" class="dads-button" data-size="xs" data-type="outline" id="close-about-btn" aria-label="閉じる">
          閉じる
        </button>
      </div>

      <div class="showcase-dialog-body">
        <section class="showcase-dialog-card">
          <p style="margin: 0 0 8px; font-size: var(--font-size-16); font-weight: 700; color: var(--color-neutral-black)">
            できること
          </p>
          <p style="margin: 0 0 10px; font-size: var(--font-size-14); color: var(--color-neutral-solid-gray-700); line-height: 1.6">
            AI に日本語で頼むだけで、ドキュメント・KPI ダッシュボード・スライド・業務 UI モックを 1 つの HTML ファイルとして生成します。画面上の 6 つのタブはすべてこのスキルで作った実物です。
          </p>
          <p style="margin: 0; font-size: var(--font-size-14); color: var(--color-neutral-solid-gray-700); line-height: 1.6">
            作った HTML はブラウザでそのまま開けるほか、<a href="https://artifactshare.com" target="_blank" rel="noopener">Artifact Share</a> に上げれば URL でチーム共有できます。このデモページ自体も同じ仕組みで公開しています。
          </p>
        </section>

        <section class="showcase-dialog-card">
          <p style="margin: 0 0 6px; font-size: var(--font-size-14); font-weight: 700; color: var(--color-neutral-black)">
            出典とライセンス
          </p>
          <p style="margin: 0; font-size: var(--font-size-14); color: var(--color-neutral-solid-gray-700); line-height: 1.6">
            デジタル庁が公開している公式デザイントークン、HTML コンポーネント全 43 種、および「ダッシュボードデザインの実践ガイドブック」の公開資産を各ライセンス（MIT 等）に従って利用しています。Artifact Share が公開する独立した OSS であり、デジタル庁の公式提供物ではありません。
          </p>
        </section>

        <div style="display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap">
          <a class="dads-button" data-size="xs" data-type="outline" href="https://github.com/artifactshare/skills" target="_blank" rel="noopener">
            GitHub
          </a>
          <button type="button" class="dads-button" data-size="xs" data-type="solid-fill" id="about-to-install-btn">
            導入方法を見る
          </button>
        </div>
      </div>
    </dialog>

    <div
      id="showcase-fs-bar"
      hidden
      style="
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 16px;
        background: var(--color-neutral-solid-gray-900);
        color: var(--color-neutral-white);
        font-size: var(--font-size-14);
      "
    >
      <span>全画面プレビュー（Esc キーで終了）</span>
      <button type="button" id="fullscreen-exit-btn" class="dads-button" data-size="xs" data-type="outline" style="background: #ffffff; color: #000000">
        全画面を閉じる
      </button>
    </div>

    <div id="showcase-stage-body" class="showcase-stage-body" style="flex: 1 1 auto; min-height: 0; overflow-y: auto">
      <div data-demo-panel="dashboard">${dashBody}</div>
      <div data-demo-panel="policy-guide" class="showcase-doc-surface" hidden>${policyBody}</div>
      <div data-demo-panel="biz-slides" class="showcase-slide-surface" hidden>${bizSlidesBody}</div>
      <div data-demo-panel="pr-review" class="showcase-doc-surface" hidden>${prReviewBody}</div>
      <div data-demo-panel="mockup" hidden>${mockupBody}</div>
      <div data-demo-panel="slides" class="showcase-slide-surface" hidden>${techSlidesBody}</div>
    </div>
  </div>
</div>`;

const showcaseThemeCss = [
  read('src/types/doc.css'),
  read('src/types/dashboard.css'),
  read('src/types/slides.css')
    .replace(/body\s*\{[^}]*\}/, '')
    .replace(/position:\s*fixed;/g, 'position: relative;')
    .replace(/width:\s*100vw;\s*height:\s*100vh;/, 'width: 100%; min-height: calc(100dvh - 180px);'),
  `
body { background: var(--color-neutral-white); overflow: hidden; }
.showcase-doc-surface { background: #f8f8fb; min-height: 100%; padding: 8px; box-sizing: border-box; }
.showcase-slide-surface { background: var(--color-neutral-solid-gray-900); min-height: 100%; display: flex; flex-direction: column; }
.showcase-slide-surface .dads-deck { flex: 1; padding: 24px; height: auto; }
.showcase-slide-surface .dads-slide { width: min(100%, 1040px); }
.showcase-slide-surface .dads-slide-progress-bar { position: static; }
.showcase-slide-surface .dads-slide-nav { position: static; }
.showcase-context-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  padding: 6px 20px;
  background: var(--color-key-50);
  border-bottom: 1px solid var(--color-key-200);
  font-size: var(--font-size-14);
  color: var(--color-neutral-solid-gray-900);
}
.showcase-context-bar[hidden] { display: none !important; }
.showcase-context-text {
  margin: 0;
  min-width: 0;
  line-height: 1.45;
}
.showcase-context-sub {
  color: var(--color-neutral-solid-gray-700);
}
.showcase-context-actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.showcase-dialog {
  width: min(640px, calc(100vw - 24px));
  max-height: calc(100dvh - 32px);
  padding: 0;
  border: 1px solid var(--color-neutral-solid-gray-200);
  border-radius: var(--border-radius-12);
  background: var(--color-neutral-white);
  color: var(--color-neutral-solid-gray-900);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.22);
  overflow: hidden;
}
.showcase-dialog::backdrop { background: rgba(0, 0, 0, 0.48); }
.showcase-dialog[open] { display: flex; flex-direction: column; }
.showcase-dialog-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--color-neutral-solid-gray-200);
  flex-shrink: 0;
}
.showcase-dialog-body {
  padding: 16px 20px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.showcase-dialog-card {
  background: #f8f8fb;
  border: 1px solid var(--color-neutral-solid-gray-200);
  border-radius: var(--border-radius-8);
  padding: 14px 16px;
}
.showcase-cmd-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.showcase-cmd-box {
  flex: 1 1 220px;
  min-width: 0;
  overflow-x: auto;
  background: var(--color-neutral-white);
  border: 1px solid var(--color-neutral-solid-gray-300);
  border-radius: var(--border-radius-8);
  padding: 6px 10px;
  font-size: var(--font-size-14);
  color: var(--color-neutral-black);
  white-space: nowrap;
}

@media (max-width: 768px) {
  html, body { max-width: 100%; overflow-x: clip; }
  body { overflow-y: auto; }
  .showcase-shell { height: auto !important; min-height: 100dvh; width: 100%; max-width: 100%; overflow: visible !important; }
  #showcase-stage,
  .showcase-stage-body,
  [data-demo-panel] { min-width: 0; max-width: 100%; }
  .showcase-stage-body { overflow-y: visible !important; }
  .showcase-header { width: 100%; max-width: 100%; min-width: 0; box-sizing: border-box; padding: 8px 12px !important; gap: 8px; flex-wrap: nowrap !important; }
  .showcase-header .dads-mock-brand { min-width: 0; font-size: var(--font-size-14) !important; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .showcase-header .dads-mock-brand > span:first-child { overflow: hidden; text-overflow: ellipsis; }
  .showcase-brand-badge,
  .showcase-install-label,
  .showcase-install-code,
  .showcase-fs-trigger,
  .showcase-group-label { display: none !important; }
  .showcase-header-actions { flex-wrap: nowrap !important; flex-shrink: 0; gap: 6px !important; }
  .showcase-toolbar {
    position: sticky;
    top: 0;
    z-index: 30;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
    padding: 6px 12px !important;
    gap: 6px !important;
    flex-direction: column;
    align-items: stretch !important;
  }
  .showcase-demo-row,
  .showcase-palette-row {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    flex-wrap: nowrap !important;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    gap: 6px !important;
  }
  .showcase-demo-row::-webkit-scrollbar,
  .showcase-palette-row::-webkit-scrollbar { display: none; }
  .showcase-demo-group { flex-wrap: nowrap !important; flex-shrink: 0; }
  .showcase-demo-row .dads-button { white-space: nowrap; flex-shrink: 0; }
  .showcase-context-bar { padding: 6px 12px; gap: 6px; width: 100%; max-width: 100%; box-sizing: border-box; }
  .showcase-context-text { font-size: 12px; }
  .showcase-context-sub { display: none; }
  .showcase-slide-surface { min-height: calc(100dvh - 118px); }
  .showcase-slide-surface .dads-deck { padding: 14px 12px; min-height: 0; align-items: flex-start; }
  .showcase-slide-surface .dads-slide-nav { position: sticky; bottom: 0; z-index: 20; }
  .dads-doc-layout, .dads-doc, .dads-dash, .dads-mock-main { max-width: 100%; min-width: 0; box-sizing: border-box; }
  .dads-section, .dads-dash-panel { overflow-x: auto; }
}
`,
].join('\n\n');

const combinedJs = [
  read('samples/dashboard/dashboard-filter.js'),
  read('samples/mockup/mockup-behavior.js'),
  read('samples/showcase/showcase.js'),
].join('\n\n');

const tmpBody = path.join(rootDir, 'samples', 'showcase', '.tmp-body.html');
const tmpTheme = path.join(rootDir, 'samples', 'showcase', '.tmp-theme.css');
const tmpJs = path.join(rootDir, 'samples', 'showcase', '.tmp-combined.js');

try {
  fs.writeFileSync(tmpBody, combinedBody, 'utf8');
  fs.writeFileSync(tmpTheme, showcaseThemeCss, 'utf8');
  fs.writeFileSync(tmpJs, combinedJs, 'utf8');

  bundle('dads-mockup', [
    '--type',
    'mockup',
    '--palette',
    'blue',
    '--title',
    'Artifact Share Agent Skills — DADS ライブショーケース',
    '--input',
    tmpBody,
    '--theme',
    tmpTheme,
    '--script',
    tmpJs,
    '--output',
    path.join(showcaseDist, 'index.html'),
  ]);
} finally {
  fs.rmSync(tmpBody, { force: true });
  fs.rmSync(tmpTheme, { force: true });
  fs.rmSync(tmpJs, { force: true });
}
