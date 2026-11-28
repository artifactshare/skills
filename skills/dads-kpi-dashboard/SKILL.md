---
name: dads-kpi-dashboard
description: デジタル庁「ダッシュボードデザインの実践ガイドブック」および 2026 年版公式 7 色テーマに完全準拠した、KPI・進捗・分析ダッシュボード（単一 HTML）を作成する。月次・日次レポート、事業計画・KPI 定点モニター、セグメント比較、データ可視化の作成時に使用する。
license: MIT
metadata:
  author: artifactshare
  version: "1.0.0"
---

# dads-kpi-dashboard — デジタル庁ダッシュボードガイドライン完全準拠の HTML 生成

## 目的

デジタル庁公式 2026 年版 7 色テーマ JSON（白背景 `#FFFFFF` ＋ ボーダーレス `#F8F8FB` 角丸 `12px` パネル ＋ コントロール領域 `#F1F1F4` ＋ パレット別公式 KPI Good/Bad 配色）に忠実な、ゼロ依存の単一 HTML ダッシュボードを生成する。

## 設計原則

1. **7 色パレットの選定（`--palette`）**：
   - `blue`（標準・全社 KPI）、`light-blue`（軽快・サービス指標）、`cyan`（技術・プロダクト分析）、`green`（成長・健全性）、`orange`（営業・キャンペーン）、`red`（障害・アラート）、`solid-gray`（中立比較）
2. **色だけに頼らない**：
   - 増減は `.dads-kpi-delta--up` / `--down` に加え、`+14.2% ▲` / `-3.1% ▼` の記号と数値を必ず併記する。
   - グラフには必ず実数ラベルを付け、棒グラフは意味のある順序（降順または時系列）で並べる。
3. **視線誘導**：左上最重要 KPI（`.dads-kpi-grid`）→ 中段グラフ（`.dads-panel-grid`：横棒 `.dads-bars`、積み上げ棒 `.dads-stacked-bar`、原点 0 基準の SVG 折れ線 `.dads-svg-chart`）→ 下段明細表（`.dads-dash-table`）。
4. **出典・集計期間・更新日時**をヘッダーと `.dads-footnote` に明記する。
5. 追加の公式コンポーネントを使う場合は [Component Catalog](references/components-catalog.md) を参照する。

## Anti-Slop ルール（禁止事項）

- KPI カードに上辺太線（`border-top: 4px`）を足さない。強調は公式 Highlight 背景（`.dads-kpi-card--highlight`）を使う。
- ページ背景とカード背景を逆転させない（白地 `#FFFFFF` の上にボーダーレス `#F8F8FB` パネル）。
- 円グラフの多用・装飾グラデーション・過剰なシャドウを避ける。

## 単一 HTML へのバンドル

```sh
node scripts/bundle.mjs \
  --type dashboard \
  --palette cyan \
  --title "KPI ダッシュボード" \
  --input body.html \
  --output output.html \
  [--script filter.js]
```
