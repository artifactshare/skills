---
name: dads-slides
description: デジタル庁デザインシステム（DADS）公式トークンと 7 色パレット、日本語文字組みに基づいた、ゼロ依存 16:9 HTML プレゼンテーションスライドを作成する。経営会議・事業部定例・企画提案などのビジネス社内 MTG 資料、技術発表、方針説明、プロジェクト振り返りのスライド作成時に使用する。
license: MIT
metadata:
  author: artifactshare
  version: "1.0.0"
---

# dads-slides — DADS 準拠 16:9 HTML スライド生成

## 目的

外部ライブラリに依存しない 16:9 固定比率のアクセシブルな HTML スライドを生成する。キーボード操作（`←` / `→` / `Space` / `Home` / `End`）、URL ハッシュによるページ指定（`#3`）、ブラウザ印刷での 1 枚 1 スライド PDF 化を標準で備える。

## スライド設計の原則（アサーション・エビデンス型）

- **1 スライド 1 メッセージ**：見出し（`h2`）は体言止め（「背景」等）ではなく、**言い切りの主張文**にする。
- **詰め込まない**：1 スライドあたり 2〜3 カラムの `.dads-slide-card` または簡潔な箇条書きに収める。
- **根拠数値を大きく見せる**：重要数値は `.dads-slide-stat` を使う。
- 追加の公式コンポーネントを使う場合は [Component Catalog](references/components-catalog.md) を参照する。

## Anti-Slop ルール（禁止事項）

- 見出しの上に `01 / PROBLEM` のような英語 eyebrow / kicker を置かない。日本語の見出し（`h2`）自体に結論を語らせる。
- 全スライドを同じ 3 カラムカードにしない。2 カラム対比・数値強調・表などを内容に応じて切り替える。
- 装飾グラデーションや片側太線をインラインで追加しない。

## 単一 HTML へのバンドル

```sh
node scripts/bundle.mjs \
  --type slides \
  --palette blue \
  --title "発表タイトル" \
  --input body.html \
  --output output.html
```
