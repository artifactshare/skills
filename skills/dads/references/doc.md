# doc — 日本語実務ドキュメントガイド

## 目的

DADS トークン・43 コンポーネントと日本語タイポグラフィ（`palt` / `line-break: strict` / `word-break: auto-phrase` / `text-autospace: normal`）を使い、会議やレビューにそのまま出せる単一 HTML ドキュメントを生成する。

## 情報設計の原則

- **結論ファースト**：冒頭（`.dads-doc-header` + `.dads-callout`）で結論・判断してほしいこと・対象読者を 30 秒で伝える。
- **1 セクション 1 テーマ**：`.dads-section > h2` が 2 つ以上あると、`scripts/bundle.mjs` がデスクトップ固定のスクロール連動目次とモバイル折りたたみ目次を自動生成する。
- **用途別の推奨構成**：
  - **技術検討・比較**：結論（`.dads-callout`）→ 比較表（`.dads-doc-table`、推奨列に `.is-recommended`）→ リスクと移行手順（`.dads-steps`）
  - **PR 内容説明**：30 秒サマリ → 用語・仕様の Before/After 表 → 変更ファイル分類＆レビュー優先度 → 確認手順
  - **社内ガイド・手順**：対象者・ゴール → 手順（`.dads-steps`）→ 注意点（`.dads-callout--warning`）→ FAQ（`.dads-accordion`）
  - **議事録・決定事項**：決定事項（`.dads-callout--success`）→ 未決論点 → 担当者・期限付きアクション表

## レイアウト注意点

- コールアウトは均一 `3px` 枠線＋白背景（`.dads-callout`）を使う。
- PR 解説や設計書で図解（処理フロー・Before/After・影響範囲マップ・シーケンス・ミニ Diff）やグラフを入れる場合は [diagrams-and-charts.md](diagrams-and-charts.md) の共通パーツ・宣言的 SVG チャートを使う。
- ルート要素は `<main class="dads-doc">...</main>` とする。

## バンドル例

```sh
node scripts/bundle.mjs \
  --type doc \
  --palette blue \
  --title "ドキュメントタイトル" \
  --input body.html \
  --output output.html
```
