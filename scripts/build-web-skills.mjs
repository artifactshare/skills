#!/usr/bin/env node
/**
 * Build script-free Web / Cloud AI skill packages (.zip) under dist/web-skills/
 * for gemini.google.com (Skills & Gems), Gemini in Chrome, Microsoft 365 Copilot /
 * Copilot Studio, and Claude.ai.
 *
 * Each .zip has:
 *   - SKILL.md at the archive root (uppercase, YAML frontmatter)
 *   - references/*.md containing pre-bundled DADS HTML/CSS/runtime templates
 *   - ZERO executable scripts (.js/.py/.sh) and ZERO OS metadata (.DS_Store/__MACOSX)
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'dist', 'web-skills');

const WEB_SKILLS = [
  {
    id: 'dads-doc',
    type: 'doc',
    title: 'DADS ドキュメント（Web AI 版）',
    components: 'accordion,button,notification-banner,table',
    description:
      'デジタル庁デザインシステム（DADS）公式トークン準拠の日本語 HTML ドキュメント（技術検討書・PR レビューガイド・社内規定・議事録）を単一 HTML で生成する。スクリプト不要の Web AI（Gemini / Microsoft 365 Copilot / Claude.ai）向け。',
    usage: '技術検討レポート、PR 内容説明、社内ガイドライン、議事録、調査報告書',
    bodyGuide: `\`\`\`html
<main class="dads-doc">
  <header class="dads-doc-header">
    <div class="dads-doc-kicker">
      <span class="dads-badge dads-badge--primary">種別バッジ</span>
    </div>
    <h1>タイトル（40 字以内）</h1>
    <p class="dads-doc-lead">結論と目的を 2〜3 文で要約。</p>
    <dl class="dads-doc-meta">
      <div><dt>作成日</dt><dd>YYYY-MM-DD</dd></div>
      <div><dt>対象</dt><dd>対象読者</dd></div>
    </dl>
  </header>

  <section class="dads-section">
    <h2>1. 結論・サマリ</h2>
    <p>本文...</p>
  </section>
</main>
\`\`\``,
  },
  {
    id: 'dads-dashboard',
    type: 'dashboard',
    title: 'DADS KPI ダッシュボード（Web AI 版）',
    components: 'button,table',
    description:
      'デジタル庁「ダッシュボードデザインの実践ガイドブック」2026 年版公式 7 色テーマ準拠の KPI ダッシュボードを単一 HTML で生成する。スクリプト不要の Web AI（Gemini / Microsoft 365 Copilot / Claude.ai）向け。',
    usage: '月次 KPI 定点モニター、売上・利用状況レポート、施策効果分析ダッシュボード',
    bodyGuide: `\`\`\`html
<main class="dads-dash">
  <header class="dads-dash-header">
    <div><h1>ダッシュボードタイトル</h1></div>
    <div class="dads-dash-meta">
      <span class="dads-badge dads-badge--primary">月次 KPI</span>
      <span>集計期間: YYYY-MM-DD 〜 YYYY-MM-DD</span>
    </div>
  </header>

  <section class="dads-kpi-grid" aria-label="主要指標">
    <article class="dads-kpi-card dads-kpi-card--highlight">
      <span class="dads-kpi-label">最重要 KPI</span>
      <div class="dads-kpi-value">48<span class="dads-kpi-unit">件</span></div>
      <span class="dads-kpi-delta dads-kpi-delta--up">前月比 +12.5% ▲</span>
    </article>
  </section>

  <section class="dads-dash-grid">
    <article class="dads-dash-panel">
      <div class="dads-dash-panel-head"><h2>内訳グラフ</h2></div>
      <!-- 横棒グラフ .dads-bar-row や SVG 折れ線グラフ（原点 0 基準）を配置 -->
    </article>
  </section>
</main>
\`\`\``,
  },
  {
    id: 'dads-slides',
    type: 'slides',
    title: 'DADS プレゼンスライド（Web AI 版）',
    components: 'table',
    description:
      'デジタル庁デザインシステム（DADS）準拠の 16:9 HTML スライド（キーボード操作・スマホ 1 カラム対応・1 枚 1 ページ PDF 印刷対応）を単一 HTML で生成する。スクリプト不要の Web AI（Gemini / Microsoft 365 Copilot / Claude.ai）向け。',
    usage: '経営会議・定例 MTG 資料、技術発表スライド、提案書、振り返り資料',
    bodyGuide: `\`\`\`html
<div class="dads-deck" role="region" aria-label="スライド">
  <section class="dads-slide dads-slide--cover is-active">
    <h1>プレゼンタイトル</h1>
    <p class="dads-slide-sub">サブタイトル・日付・発表者</p>
  </section>

  <section class="dads-slide">
    <div class="dads-slide-head"><h2>結論を言い切る見出し</h2></div>
    <div class="dads-slide-body">
      <div class="dads-slide-cols">
        <div class="dads-slide-card"><h3>ポイント 1</h3><p>説明...</p></div>
        <div class="dads-slide-card dads-slide-card--accent"><h3>ポイント 2</h3><p>説明...</p></div>
      </div>
    </div>
    <div class="dads-slide-foot"><span>タイトル</span><span>2</span></div>
  </section>
</div>
<div class="dads-slide-progress-bar"><div class="dads-slide-progress-fill" data-slide-progress></div></div>
<nav class="dads-slide-nav" aria-label="スライド操作">
  <span>← → / Space で移動・ブラウザ印刷でそのまま PDF 化</span>
  <div class="dads-slide-nav-btns">
    <button type="button" data-slide-prev>前へ</button>
    <span data-slide-counter>1 / 2</span>
    <button type="button" data-slide-next>次へ</button>
  </div>
</nav>
\`\`\``,
  },
  {
    id: 'dads-mockup',
    type: 'mockup',
    title: 'DADS 業務 UI モック（Web AI 版）',
    components: 'button,checkbox,form-control-label,input-text,notification-banner,select,table,textarea',
    description:
      'デジタル庁デザインシステム（DADS）公式フォーム・ボタン・テーブル・通知バナー準拠の操作可能な業務 UI モックアップを単一 HTML で生成する。スクリプト不要の Web AI（Gemini / Microsoft 365 Copilot / Claude.ai）向け。',
    usage: '申請フォーム、管理画面プロトタイプ、承認ワークフロー UI モック',
    bodyGuide: `\`\`\`html
<div class="dads-mock-shell">
  <header class="dads-mock-topbar">
    <div class="dads-mock-brand">
      <span>アプリ名</span>
      <span class="dads-badge dads-badge--primary">UI モック</span>
    </div>
  </header>
  <main class="dads-mock-main">
    <div class="dads-mock-heading"><h1>画面タイトル</h1></div>
    <div class="dads-mock-card">
      <!-- 公式 .dads-input-text / .dads-select / .dads-checkbox / .dads-button / .dads-table を配置 -->
    </div>
  </main>
</div>
\`\`\``,
  },
];

// Minimal zero-dependency ZIP writer (STORE/DEFLATE, UTF-8 filenames, no OS metadata)
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createZipBuffer(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const { name, content } of entries) {
    const nameBuf = Buffer.from(name, 'utf8');
    const rawBuf = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8');
    const compressed = zlib.deflateRawSync(rawBuf, { level: 9 });
    const crc = crc32(rawBuf);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0x0800, 6); // UTF-8 flag
    local.writeUInt16LE(8, 8); // deflate
    local.writeUInt16LE(0, 10); // time
    local.writeUInt16LE(0x5421, 12); // fixed date (deterministic build)
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(rawBuf.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, nameBuf, compressed);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4); // version made by
    central.writeUInt16LE(20, 6); // version needed
    central.writeUInt16LE(0x0800, 8); // UTF-8 flag
    central.writeUInt16LE(8, 10); // deflate
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0x5421, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(rawBuf.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, nameBuf);

    offset += local.length + nameBuf.length + compressed.length;
  }

  const centralBuf = Buffer.concat(centralParts);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralBuf, eocd]);
}

function generateHtmlShell(skill) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dads-web-'));
  const bodyFile = path.join(tmpDir, 'body.html');
  const outFile = path.join(tmpDir, 'template.html');
  try {
    fs.writeFileSync(bodyFile, '<!-- CONTENT_HERE -->', 'utf8');
    execFileSync(
      'node',
      [
        path.join(rootDir, 'src', 'bundle.mjs'),
        '--type',
        skill.type,
        '--palette',
        'blue',
        '--title',
        '{{TITLE}}',
        '--components',
        skill.components,
        '--input',
        bodyFile,
        '--output',
        outFile,
      ],
      { stdio: 'pipe' },
    );
    return fs.readFileSync(outFile, 'utf8');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

function buildTemplateMarkdown(skill, htmlShell) {
  return `# ${skill.title} — 公式 DADS 単一 HTML テンプレート

以下の HTML テンプレートの \`<style>\` および \`<script>\` はデジタル庁デザインシステム公式トークン（\`@digital-go-jp/design-tokens@2.1.0\`）および公式コンポーネント CSS から自動生成されたものです。

**出力ルール**:
- \`<style>\` ブロックの内容は省略・改変せず、そのまま出力 HTML の \`<head>\` に含めてください。
- \`data-palette="blue"\` はユーザーの指定に応じて \`blue\` / \`light-blue\` / \`cyan\` / \`green\` / \`orange\` / \`red\` / \`solid-gray\` に変更できます（未指定時は \`blue\`）。
- \`{{TITLE}}\` と \`<!-- CONTENT_HERE -->\` のみをユーザーの依頼内容に合わせて置き換えてください。

## 本文 HTML の基本構造

${skill.bodyGuide}

## 完全 HTML テンプレート

\`\`\`html
${htmlShell.trim()}
\`\`\`
`;
}

function buildSingleSkillMd(skill) {
  return `---
name: ${skill.id}
description: ${skill.description}
license: MIT
compatibility: gemini, gemini-in-chrome, m365-copilot, copilot-studio, claude-web
---

# ${skill.title}

## 用途
${skill.usage}

## 手順（スクリプト実行不要・Web / クラウド AI 向け）

1. 添付の \`references/dads-template.md\` を読み込む。
2. テンプレート内の \`<style>\` と \`<script>\` を改変・省略せずそのまま使い、\`{{TITLE}}\` と \`<!-- CONTENT_HERE -->\` だけを日本語コンテンツで埋めた **完全な単一 HTML ファイル** を生成する。
3. Gemini の Canvas や Claude の Artifacts が使える場合は、そのままプレビュー可能な単一 HTML として出力する。

## デザイン・品質ルール（厳守）
- **公式 7 色パレット**: \`<html lang="ja" data-palette="...">\` に \`blue\`（既定）/ \`light-blue\` / \`cyan\` / \`green\` / \`orange\` / \`red\` / \`solid-gray\` を指定する。
- **AI スロップ禁止**: 装飾目的のグラデーション（\`linear-gradient\`）、紫系ネオン配色、見出し上の装飾キッカー、角丸カードへの太い片側ボーダー（\`border-left: 8px\` 等）は使わない。
- **アクセシビリティ**: コントラスト比 4.5:1 以上、表には \`<thead>\` / \`<th>\`、数値には半角数字を使う。
- **共有導線**: 出力した HTML はローカルで開けるほか、[Artifact Share](https://artifactshare.com) にアップロードしてそのままリンク共有できる。
`;
}

function buildAllInOneSkillMd() {
  return `---
name: dads-design-pack
description: デジタル庁デザインシステム（DADS）完全準拠の単一 HTML（ドキュメント・KPI ダッシュボード・16:9 スライド・業務 UI モック）を生成するオールインワンパック。DADS・デジタル庁デザインシステム・社内資料・ダッシュボード・スライド・UI モック作成の依頼で使用する。
license: MIT
compatibility: gemini, gemini-in-chrome, m365-copilot, copilot-studio, claude-web
---

# デジタル庁デザインシステム（DADS）完全準拠パック（Web / クラウド AI 版）

1 つのスキルで 4 種類の単一 HTML 資料を生成できます。ユーザーの依頼内容に合わせて、対応するテンプレートを \`references/\` から 1 つ選んでください。

| 依頼内容 | 使用するテンプレート |
|---|---|
| 技術検討書、PR レビューガイド、社内ルール、議事録、報告書 | \`references/template-doc.md\` |
| KPI ダッシュボード、月次レポート、数値モニター、グラフ分析 | \`references/template-dashboard.md\` |
| 発表スライド、社内 MTG 資料、提案スライド（16:9・PDF 印刷対応） | \`references/template-slides.md\` |
| 申請フォーム、管理画面、動く業務 UI モックアップ | \`references/template-mockup.md\` |

## 生成手順
1. 上表から該当する \`references/template-*.md\` を 1 つ読み込む。
2. テンプレート内の \`<style>\` と \`<script>\` を改変・省略せずそのまま使い、\`{{TITLE}}\` と \`<!-- CONTENT_HERE -->\` だけを日本語コンテンツで埋めた **完全な単一 HTML ファイル** を生成する。
3. Gemini の Canvas や Claude の Artifacts が使える場合は、そのままプレビュー可能な単一 HTML として出力する。

## デザイン・品質ルール（厳守）
- **公式 7 色パレット**: \`<html lang="ja" data-palette="...">\` に \`blue\`（既定）/ \`light-blue\` / \`cyan\` / \`green\` / \`orange\` / \`red\` / \`solid-gray\` を指定する。
- **AI スロップ禁止**: 装飾目的のグラデーション（\`linear-gradient\`）、紫系ネオン配色、見出し上の装飾キッカー、角丸カードへの太い片側ボーダーは使わない。
- **日本語の読みやすさ**: 見出しは結論ベースで簡潔にし、数値・比較は表やグラフで整理する。
- **共有導線**: 出力した HTML はローカルブラウザでそのまま開けるほか、[Artifact Share](https://artifactshare.com) にアップロードしてリンク共有できる。
`;
}

function main() {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const allInOneEntries = [{ name: 'SKILL.md', content: buildAllInOneSkillMd() }];

  for (const skill of WEB_SKILLS) {
    const htmlShell = generateHtmlShell(skill);
    const templateMd = buildTemplateMarkdown(skill, htmlShell);
    const skillMd = buildSingleSkillMd(skill);

    const zipBuf = createZipBuffer([
      { name: 'SKILL.md', content: skillMd },
      { name: 'references/dads-template.md', content: templateMd },
    ]);
    const zipPath = path.join(outDir, `${skill.id}-web.zip`);
    fs.writeFileSync(zipPath, zipBuf);
    console.log(
      `Built ${path.relative(rootDir, zipPath)} (${(zipBuf.length / 1024).toFixed(1)} KB, 2 files, 0 scripts)`,
    );

    allInOneEntries.push({
      name: `references/template-${skill.type}.md`,
      content: templateMd,
    });
  }

  const allZipBuf = createZipBuffer(allInOneEntries);
  const allZipPath = path.join(outDir, 'dads-all-in-one-web.zip');
  fs.writeFileSync(allZipPath, allZipBuf);
  console.log(
    `Built ${path.relative(rootDir, allZipPath)} (${(allZipBuf.length / 1024).toFixed(1)} KB, ${allInOneEntries.length} files, 0 scripts)`,
  );
}

main();
