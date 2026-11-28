# diagrams-and-charts — 図解・PR レビュー・宣言的 SVG チャートガイド

`doc` / `dashboard` / `slides` / `mockup` の全モードで共通利用できる、ゼロ依存の図解 CSS パーツ（7 種）と宣言的 SVG チャート（7 種）のリファレンス。
すべて DADS のトークンおよび 7 色パレット（`--dads-chart-1..6`）に自動連動し、モバイル幅（390px）でも崩れない。

> **文書内での鉄則（図版だけで伝えきらない）**：`doc` モードで図解やグラフを配置するときは、図単体をポンと置かず、**必ず直前に 1〜2 行の要約・読み解きポイント（何がどう変わったか／どこを見るべきか）を本文として添える**こと。

---

## A. 図解・PR レビューパーツ（CSS のみ・座標ズレゼロ）

### 1. レビュー判断サマリ（`.dads-review-meta`）
PR の変更意図・影響範囲・後戻り可否（One-way / Two-way Door）・確認ポイントを冒頭に並べる。`data-tone="key|warning|danger"` で強調可能。

```html
<div class="dads-review-meta">
  <div class="dads-review-card" data-tone="key">
    <span class="dads-review-card-label">変更意図</span>
    <p class="dads-review-card-value">Webhook の二重計上を防止</p>
    <p class="dads-review-card-note">冪等性キー＋指数バックオフ導入</p>
  </div>
  <div class="dads-review-card" data-tone="warning">
    <span class="dads-review-card-label">後戻り可否</span>
    <p class="dads-review-card-value">Two-way Door（フラグ切戻し可）</p>
    <p class="dads-review-card-note">新規テーブル追加のみ</p>
  </div>
</div>
```

### 2. 処理フロー図（`.dads-flow`）
直列フロー＋分岐。各ノードに `data-status="added|changed|removed"` で差分を明示できる。

```html
<div class="dads-flow" role="group" aria-label="処理フロー">
  <div class="dads-flow-step">
    <div class="dads-flow-step-head"><h4 class="dads-flow-step-title">1. Webhook 受信</h4></div>
    <p class="dads-flow-step-desc">署名ヘッダを検証</p>
  </div>
  <div class="dads-flow-arrow" aria-hidden="true">→</div>
  <div class="dads-flow-step" data-status="added">
    <div class="dads-flow-step-head">
      <h4 class="dads-flow-step-title">2. 冪等性チェック</h4>
      <span class="dads-badge dads-badge--primary">新規</span>
    </div>
    <p class="dads-flow-step-desc">UNIQUE 制約で重複を除外</p>
  </div>
  <div class="dads-flow-branch">
    <div class="dads-flow-step" data-status="added">
      <h4 class="dads-flow-step-title">分岐 A: 新規イベント</h4>
      <p class="dads-flow-step-desc">売上確定し 200 返却</p>
    </div>
    <div class="dads-flow-step" data-status="changed">
      <h4 class="dads-flow-step-title">分岐 B: 一時エラー</h4>
      <p class="dads-flow-step-desc">指数バックオフで最大 5 回再試行</p>
    </div>
  </div>
</div>
```

### 3. Before / After 構造比較（`.dads-compare`）
```html
<div class="dads-compare">
  <div class="dads-compare-pane" data-kind="before">
    <div class="dads-compare-head"><h4 class="dads-compare-title">変更前（Before）</h4></div>
    <ul class="dads-compare-list">
      <li>重複受信のたびに売上レコードを INSERT</li>
      <li>DB タイムアウト時に即 500 応答</li>
    </ul>
  </div>
  <div class="dads-compare-pane" data-kind="after">
    <div class="dads-compare-head"><h4 class="dads-compare-title">変更後（After）</h4></div>
    <ul class="dads-compare-list">
      <li class="is-highlight">(provider, event_id) の UNIQUE 制約で重複を安全にスキップ</li>
      <li class="is-highlight">指数バックオフで最大 5 回自動リトライ＋DLQ 退避</li>
    </ul>
  </div>
</div>
```

### 4. 影響範囲・レイヤー構成図（`.dads-arch`）
`data-impact="new|touched|unchanged"` で変更範囲を可視化する。

```html
<div class="dads-arch">
  <div class="dads-arch-layer">
    <div class="dads-arch-layer-name">Edge / Routes</div>
    <div class="dads-arch-nodes">
      <span class="dads-arch-node" data-impact="touched">webhooks/stripe.ts（変更）</span>
      <span class="dads-arch-node" data-impact="unchanged">auth/session.ts</span>
    </div>
  </div>
  <div class="dads-arch-layer">
    <div class="dads-arch-layer-name">Service / DB</div>
    <div class="dads-arch-nodes">
      <span class="dads-arch-node" data-impact="new">idempotency.ts（新規）</span>
      <span class="dads-arch-node" data-impact="new">0042_webhook_idempotency.sql（新規）</span>
    </div>
  </div>
</div>
```

### 5. 軽量シーケンス図（`.dads-seq`）
```html
<div class="dads-seq">
  <div class="dads-seq-actors">
    <div class="dads-seq-actor">Stripe</div>
    <div class="dads-seq-actor">Webhook API</div>
    <div class="dads-seq-actor">Database</div>
  </div>
  <div class="dads-seq-rows">
    <div class="dads-seq-row"><span class="dads-seq-path">Stripe → API</span><span class="dads-seq-msg">POST /webhooks/stripe (event_id)</span></div>
    <div class="dads-seq-row" data-tone="key"><span class="dads-seq-path">API → DB</span><span class="dads-seq-msg">INSERT OR IGNORE webhook_events</span></div>
    <div class="dads-seq-row"><span class="dads-seq-path">API → Stripe</span><span class="dads-seq-msg">200 OK（重複時も冪等に成功応答）</span></div>
  </div>
</div>
```

### 6. ミニ Diff 比較ブロック（`.dads-diff`）
```html
<div class="dads-diff">
  <div class="dads-diff-head">
    <span>routes/webhooks/stripe.ts</span>
    <span class="dads-diff-stats"><span class="dads-diff-stat-add">+14</span><span class="dads-diff-stat-del">-3</span></span>
  </div>
  <div class="dads-diff-grid">
    <pre class="dads-diff-pane"><span class="dads-diff-pane-label">Before</span><code class="dads-diff-line dads-diff-line--del">- await recordPayment(event)</code></pre>
    <pre class="dads-diff-pane"><span class="dads-diff-pane-label">After</span><code class="dads-diff-line dads-diff-line--add">+ const lock = await acquireIdempotency(event.id)</code><code class="dads-diff-line dads-diff-line--add">+ if (!lock.acquired) return ok({ duplicate: true })</code><code class="dads-diff-line dads-diff-line--add">+ await recordPayment(event)</code></pre>
  </div>
</div>
```

### 7. ステップ連動ハイライト（`.dads-walkthrough`）
左の `[data-step="1"]` ボタンをクリックすると、右の図解内の `[data-step-target="1"]` が `.is-active` になる（`bundle.mjs` が自動配線）。

---

## B. 宣言的 SVG チャート（7 種・ビルド時自動生成）

生の `<svg>` 座標を手計算せず、以下の JSON ブロックを書くだけで `scripts/bundle.mjs` が原点 0・実数ラベル・DADS 7 色パレット連動の静的 SVG を生成する。

```html
<!-- 1. 横棒グラフ (hbar) -->
<div class="dads-chart" data-chart="hbar">
  <script type="application/json">
  { "title": "カテゴリ別件数", "unit": "件", "items": [{ "label": "決済 API", "value": 42, "highlight": true }, { "label": "認証", "value": 18 }] }
  </script>
</div>

<!-- 2. 縦棒グラフ / Before-After 比較 (bar) -->
<div class="dads-chart" data-chart="bar">
  <script type="application/json">
  { "title": "P95 レイテンシ比較", "unit": "ms", "labels": ["通常時", "重複受信", "リトライ時"], "series": [{ "name": "変更前", "values": [120, 240, 890] }, { "name": "変更後", "values": [115, 28, 180] }] }
  </script>
</div>

<!-- 3. 100% 積み上げ帯グラフ (stacked) -->
<div class="dads-chart" data-chart="stacked">
  <script type="application/json">
  { "title": "プラン別構成比", "seriesNames": ["Free", "Plus", "Team"], "rows": [{ "label": "Q3", "values": [62, 26, 12] }, { "label": "Q4", "values": [51, 31, 18] }] }
  </script>
</div>

<!-- 4. 折れ線グラフ＋目標破線 (line) -->
<div class="dads-chart" data-chart="line">
  <script type="application/json">
  { "title": "月次アクティブチーム推移", "unit": "社", "labels": ["4月", "5月", "6月", "7月", "8月", "9月"], "series": [{ "name": "実績", "values": [42, 58, 74, 96, 128, 164] }], "target": { "value": 150, "label": "Q2 目標 150社" } }
  </script>
</div>

<!-- 5. ドーナツグラフ (donut) -->
<div class="dads-chart" data-chart="donut">
  <script type="application/json">
  { "title": "変更ファイル内訳", "centerLabel": "総ファイル", "unit": "件", "items": [{ "label": "型・フィクスチャ", "value": 19 }, { "label": "テスト", "value": 11 }, { "label": "コア実装", "value": 4 }] }
  </script>
</div>

<!-- 6. スパークライン (sparkline) -->
<div class="dads-chart dads-chart--inline" data-chart="sparkline">
  <script type="application/json">
  { "values": [12, 18, 15, 24, 31, 42], "ariaLabel": "直近 6 週の推移" }
  </script>
</div>

<!-- 7. 散布図 / 4 象限マトリクス (scatter) -->
<div class="dads-chart" data-chart="scatter">
  <script type="application/json">
  { "title": "施策の優先度マトリクス", "xLabel": "実装工数", "yLabel": "期待効果", "xMax": 10, "yMax": 10, "quadrants": ["最優先", "大型投資", "後回し", "クイックウィン"], "points": [{ "label": "冪等性キー", "x": 3, "y": 9, "highlight": true }, { "label": "DLQ 可視化", "x": 6, "y": 7 }] }
  </script>
</div>
```
