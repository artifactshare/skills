---
name: dads-mockup
description: デジタル庁デザインシステム（DADS）の公式 HTML コンポーネント全 43 種（フォーム入力、ボタン、セレクト、チェックボックス、ラジオ、タブ、テーブル、モーダル、アコーディオン、通知バナー等）を使って、ブラウザで実際に操作できる業務画面 UI モック・プロトタイプ（単一 HTML）を作成する。新機能の画面試作、社内ツール UI モック、請求・申請フロー確認画面の作成時に使用する。
license: MIT
metadata:
  author: artifactshare
  version: "1.0.0"
---

# dads-mockup — DADS 全 43 コンポーネントによる動く業務 UI モック生成

## 目的

開発前の合意形成や業務フロー確認のために、デジタル庁デザインシステム（DADS）の公式フォーム・ナビゲーション・フィードバックコンポーネントをそのまま使った**操作可能な単一 HTML UI モック**を生成する。

## 設計原則

1. **公式コンポーネントクラスをそのまま使う**：[Component Catalog](references/components-catalog.md) と [Component Snippets](references/component-snippets.md) を必ず参照し、`dads-button`、`dads-input-text`、`dads-select`（`.dads-select__chevron` 必須）、`dads-checkbox`、`dads-radio`、`dads-textarea`、`dads-form-control-label`、`dads-table`、`dads-notification-banner`（`.dads-notification-banner__icon` 必須）、`dads-accordion` 等を正確な DOM 構造で記述する。`scripts/bundle.mjs` が使用された公式 CSS を自動でバンドルする。
2. **「操作できる」実在感を作る**：
   - タブ切替（`role="tablist"` / `role="tab"` / `aria-controls`）は `scripts/bundle.mjs` が自動配線する。
   - 申請・保存・ステータス更新などの主要操作は、軽量なインライン JS（`--script`）で実際に画面状態（一覧への追加、確認バナー表示、バリデーションエラー表示など）が動くようにする。
3. **現実的な日本語業務データを入れる**：`Lorem ipsum` や `テスト1` ではなく、実際の業務に近い項目名・金額・ステータス・エラー文言を使う。
4. **アクセシビリティ**：すべての入力に `<label>` と必須/任意表示（`dads-form-control-label`）、フォーカス移動、エラー表示（`aria-invalid`）を備える。

## Anti-Slop ルール（禁止事項）

- 装飾的なグラデーション、不要なアイコン乱用、片側太線カードを使わない。
- 見出しの上の英語 eyebrow / kicker を置かない。
- 見た目を整えるためだけに独自 CSS を大量に書かず、公式 DADS コンポーネントと `.dads-mock-*` シェルクラスを使う。

## 単一 HTML へのバンドル

```sh
node scripts/bundle.mjs \
  --type mockup \
  --palette blue \
  --title "業務画面 UI モック" \
  --input body.html \
  --output output.html \
  [--script mock-behavior.js]
```

## 作成後の共有（任意）

動く UI モックは非エンジニアの意思決定者に URL 1 つで触ってもらうのが最も効果的なため、環境に `as` CLI / MCP が利用可能な場合は URL 共有・コメント回収を提案する。
