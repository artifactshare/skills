# dashboard — KPI・分析ダッシュボードガイド

## 目的

デジタル庁「ダッシュボードデザインの実践ガイドブック」の 7 色テーマ定義（白背景 `#FFFFFF` ＋ ボーダーレス `#F8F8FB` 角丸 `12px` パネル ＋ コントロール領域 `#F1F1F4` ＋ パレット別 KPI Good/Bad 配色）に沿った、ゼロ依存の単一 HTML ダッシュボードを生成する。

## 設計原則

1. **7 色パレットの選定（`--palette`）**：
   - `blue`（標準・全社 KPI）、`light-blue`（軽快・サービス指標）、`cyan`（技術・プロダクト分析）、`green`（成長・健全性）、`orange`（営業・キャンペーン）、`red`（障害・アラート）、`solid-gray`（中立比較）
2. **色だけに頼らない**：
   - 増減は `.dads-kpi-delta--up` / `--down` に加え、`+14.2% ▲` / `-3.1% ▼` の記号と数値を必ず併記する。
   - グラフには必ず実数ラベルを付け、棒グラフは意味のある順序（降順または時系列）で並べる。
3. **視線誘導**：左上最重要 KPI（`.dads-kpi-grid`）→ 中段グラフ（`.dads-panel-grid`：横棒 `.dads-bars`、積み上げ棒 `.dads-stacked-bar`、原点 0 基準の SVG 折れ線 `.dads-svg-chart`）→ 下段明細表（`.dads-dash-table`）。
4. **出典・集計期間・更新日時**をヘッダーと `.dads-footnote` に明記する。

## レイアウト注意点

- KPI カードに上辺太線（`border-top: 4px`）を足さない。強調は Highlight 背景（`.dads-kpi-card--highlight`）を使う。
- ページ背景とカード背景を逆転させない（白地 `#FFFFFF` の上にボーダーレス `#F8F8FB` パネル）。
- 円グラフの多用を避け、比較は横棒や積み上げ棒を使う。
- ルート要素は `<main class="dads-dash">...</main>` とする。

## バンドル例

```sh
node scripts/bundle.mjs \
  --type dashboard \
  --palette cyan \
  --title "KPI ダッシュボード" \
  --input body.html \
  --output output.html \
  [--script filter.js]
```
