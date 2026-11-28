---
name: dads
description: デジタル庁デザインシステム（DADS）の公開 MIT アセット（トークン・全 43 コンポーネント・7 色パレット）を使い、日本語実務ドキュメント（doc）、KPI ダッシュボード（dashboard）、16:9 プレゼン資料（slides）、動く業務画面 UI モック（mockup）をゼロ依存の単一 HTML で生成する独立サードパーティ製スキル。引数（doc / dashboard / slides / mockup）または依頼内容で用途を切り替える。
license: MIT
metadata:
  author: artifactshare
  version: "1.0.0"
---

# dads — DADS ベースの単一 HTML 生成スキル（ドキュメント・ダッシュボード・スライド・UI モック）

> Independent third-party skill maintained by Artifact Share (not affiliated with or endorsed by Japan's Digital Agency). Uses public MIT-licensed design tokens and component CSS from `digital-go-jp`.
> 本スキルは Artifact Share が公開する独立したサードパーティ製スキルです（デジタル庁の公式提供物ではありません）。

## 1. 用途の選択（引数または依頼内容でルーティング）

ユーザーの引数（例：`/dads doc`, `/dads dashboard`, `/dads slides`, `/dads mockup`）または依頼内容に応じて、該当する詳細ガイドを `references/` から 1 つ読み込んでから HTML を生成する。

| 引数 (`--type`) | 用途 | 参照する詳細ガイド |
|---|---|---|
| `doc` | 技術検討書、PR レビューガイド、社内ルール・ガイド、議事録、報告書 | [references/doc.md](references/doc.md) |
| `dashboard` | KPI 定点モニター、月次・日次分析、売上・進捗ダッシュボード | [references/dashboard.md](references/dashboard.md) |
| `slides` | 経営会議・定例スライド、技術発表、企画提案（16:9・PDF 印刷対応） | [references/slides.md](references/slides.md) |
| `mockup` | 業務画面プロトタイプ、申請フォーム、管理画面の動く UI モック | [references/mockup.md](references/mockup.md) |

追加の DADS コンポーネントを使う場合は [references/components-catalog.md](references/components-catalog.md) と [references/component-snippets.md](references/component-snippets.md) を、図解（フロー図・構成図・Before/After・シーケンス・PR Diff）や宣言的 SVG チャート（7 種）を使う場合は [references/diagrams-and-charts.md](references/diagrams-and-charts.md) を参照する。

## 2. 共通の設計・Anti-Slop ルール

- **7 色パレット（`--palette`）**：`blue`（既定・標準）、`light-blue`（軽快）、`cyan`（技術・分析）、`green`（成長・健全性）、`orange`（営業・施策）、`red`（障害・注意）、`solid-gray`（中立比較）。
- **プロジェクト独自テーマ**：カスタム CSS（例：`.artifactshare/theme.css`）がある場合は `--theme` で上書きする。
- **装飾過多（AI スロップ）の禁止**：
  - 装飾目的のグラデーション、紫系ネオン配色、過剰なシャドウを使わない。
  - 見出し上の英語 eyebrow / kicker（`01 / OVERVIEW` など）や絵文字アイコンの乱用を避ける。
  - 角丸カードへの片側太線（`border-left: 4px+` / `border-top: 4px+`）を足さない。
  - 全セクションを同じ 3 カラムカードで埋めない。
- **アクセシビリティ**：色だけに依存せず記号やテキストを併記し、表には `<thead>` / `<th>`、フォームには `<label>` を備える。

## 3. 単一 HTML へのバンドル

AI はクリーンなセマンティック HTML 本文（`body.html`）のみを書き、同梱の `scripts/bundle.mjs` で単一 HTML 化する（本文で使われた `.dads-*` コンポーネント CSS は自動でツリーシェイク・バンドルされる）。

```sh
node scripts/bundle.mjs \
  --type <doc|dashboard|slides|mockup> \
  --palette blue \
  --title "タイトル" \
  --input body.html \
  --output output.html \
  [--theme custom.css] \
  [--script behavior.js]
```
