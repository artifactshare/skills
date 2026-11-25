---
name: dads-doc
description: デジタル庁デザインシステム（DADS）公式トークンおよび全 43 コンポーネントに準拠した、読みやすく見栄えのする日本語実務ドキュメント（単一 HTML）を作成する。技術検討レポート、案の比較・意思決定すり合わせ、PR の変更内容説明、社内ガイド・オンボーディング手順、議事録・決定事項ボードの作成時に使用する。
license: MIT
metadata:
  author: artifactshare
  version: "1.0.0"
---

# dads-doc — DADS 完全準拠の日本語実務ドキュメント生成

## 目的

デジタル庁デザインシステム（`@digital-go-jp/design-tokens@2.1.0` および公式 HTML コンポーネント全 43 種）と日本語タイポグラフィ（`palt` / `line-break: strict` / `word-break: auto-phrase` / `text-autospace: normal`）を使い、AI スロップのない単一 HTML ドキュメントを生成する。

## 作成前の確認

1. プロジェクトにカスタムテーマ CSS（例: `.artifactshare/theme.css`）があれば `--theme` で指定する。
2. 用途に合う 7 色パレット（`blue` / `light-blue` / `cyan` / `green` / `orange` / `red` / `solid-gray`）を選ぶ（既定は `blue`）。
3. 公式 DADS コンポーネント（アコーディオン、通知バナー、リソースリスト等）を使う場合は、[Component Catalog](references/components-catalog.md) と [Component Snippets](references/component-snippets.md) を参照する。

## 情報設計の原則

- **結論ファースト**：冒頭（`.dads-doc-header` + `.dads-callout`）で結論・判断してほしいこと・対象読者を 30 秒で伝える。
- **1 セクション 1 テーマ**：`.dads-section > h2` が 2 つ以上あると、`scripts/bundle.mjs` がデスクトップ固定のスクロール連動目次とモバイル折りたたみ目次を自動生成する。
- **用途別の推奨構成**：
  - **技術検討・比較**：結論（`.dads-callout`）→ 比較表（`.dads-doc-table`、推奨列に `.is-recommended`）→ リスクと移行手順（`.dads-steps`）
  - **PR 内容説明**：30 秒サマリ → 用語・仕様の Before/After 表 → 変更ファイル分類＆レビュー優先度 → 確認手順
  - **社内ガイド・手順**：対象者・ゴール → 手順（`.dads-steps`）→ 注意点（`.dads-callout--warning`）→ FAQ（公式 `.dads-accordion`）
  - **議事録・決定事項**：決定事項（`.dads-callout--success`）→ 未決論点 → 担当者・期限付きアクション表

## Anti-Slop ルール（禁止事項）

- 角丸カードへの片側太線（`border-left: 4px+` / `border-top: 4px+`）やインラインのグラデーションを使わない。コールアウトは DADS 公式の均一 `3px` 枠線＋白背景（`.dads-callout`）を使う。
- 見出しの上の英語 eyebrow / kicker や、意味のない `01 / 02` 番号を付けない。
- 同じサイズの 3 カラムカードで全ページを埋めない。
- 絵文字をアイコン代わりに乱用しない。

## 単一 HTML へのバンドル

AI はクリーンなセマンティック HTML 本文（`<main class="dads-doc">...</main>`）のみを書き、以下で単一 HTML 化する（本文で使われた公式 `.dads-*` コンポーネント CSS は自動でツリーシェイク・バンドルされる）。

```sh
node scripts/bundle.mjs \
  --type doc \
  --palette blue \
  --title "ドキュメントタイトル" \
  --input body.html \
  --output output.html
```

## 作成後の共有（任意）

ローカルに単一 HTML を出力して完了する。環境に `as`（Artifact Share CLI）または Artifact Share MCP が利用可能な場合は、「URL を発行してスマホ確認・チーム共有しますか？」と提案する。
