# mockup — 動く業務画面 UI モックガイド

## 目的

開発前の合意形成や業務フロー確認のために、DADS の公開フォーム・ナビゲーション・フィードバックコンポーネントを使った**操作可能な単一 HTML UI モック**を生成する。

## 設計原則

1. **DADS コンポーネントクラスをそのまま使う**：[components-catalog.md](components-catalog.md) と [component-snippets.md](component-snippets.md) を参照し、`dads-button`、`dads-input-text`、`dads-select`（`.dads-select__chevron` 必須）、`dads-checkbox`、`dads-radio`、`dads-textarea`、`dads-form-control-label`、`dads-table`、`dads-notification-banner`（`.dads-notification-banner__icon` 必須）、`dads-accordion` 等を正確な DOM 構造で記述する。
2. **「操作できる」実在感を作る**：
   - タブ切替（`role="tablist"` / `role="tab"` / `aria-controls`）は `scripts/bundle.mjs` が自動配線する。
   - 申請・保存・ステータス更新などの主要操作は、軽量なインライン JS（`--script`）で画面状態（一覧への追加、確認バナー表示、バリデーションエラー表示など）が実際に動くようにする。
3. **現実的な日本語業務データを入れる**：`Lorem ipsum` や `テスト1` ではなく、実際の業務に近い項目名・金額・ステータス・エラー文言を使う。
4. **アクセシビリティ**：すべての入力に `<label>` と必須/任意表示（`dads-form-control-label`）、フォーカス移動、エラー表示（`aria-invalid`）を備える。
5. 見た目を整えるためだけに独自 CSS を大量に書かず、DADS コンポーネントと `.dads-mock-*` シェルクラスを使う。

## バンドル例

```sh
node scripts/bundle.mjs \
  --type mockup \
  --palette blue \
  --title "業務画面 UI モック" \
  --input body.html \
  --output output.html \
  [--script mock-behavior.js]
```
