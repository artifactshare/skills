# Official DADS Component Minimal HTML Snippets

These snippets follow the exact DOM contracts required by `digital-go-jp/design-system-example-components-html`.
Skipping required wrapper or icon elements (such as `.dads-notification-banner__icon` or `.dads-select__chevron`) will break the official CSS grid/layout.

## Notification Banner (`notification-banner`)

Always include `.dads-notification-banner__icon` as the first child of `.dads-notification-banner__heading`.

```html
<div class="dads-notification-banner" data-style="standard" data-type="error" role="alert">
  <h2 class="dads-notification-banner__heading">
    <svg class="dads-notification-banner__icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="currentcolor" />
      <path d="M11 7h2v6h-2zm0 8h2v2h-2z" fill="#ffffff" />
    </svg>
    <span class="dads-notification-banner__heading-text">必須項目を入力してください。</span>
  </h2>
  <div class="dads-notification-banner__body">
    <p>補足説明がある場合はここに記述します。</p>
  </div>
</div>
```

`data-type`: `info-1` | `info-2` | `success` | `warning` | `error`

## Select (`select`)

Always wrap `<select>` in `.dads-select__control` and include `.dads-select__chevron` (official CSS sets `appearance: none`).

```html
<div class="dads-form-control-label" data-size="md">
  <label class="dads-form-control-label__label" for="dept">
    部署
    <span class="dads-form-control-label__requirement" data-required="true">※必須</span>
  </label>
  <span class="dads-select">
    <span class="dads-select__control">
      <select class="dads-select__select" id="dept" data-size="md">
        <option value="dev">プロダクト開発部</option>
        <option value="biz">事業推進部</option>
      </select>
      <svg class="dads-select__chevron" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 17.1 3 8l1.4-1.4 7.6 7.6 7.6-7.6L21 8z" fill="currentcolor" />
      </svg>
    </span>
  </span>
</div>
```

## Input Text & Textarea (`input-text`, `textarea`)

```html
<span class="dads-input-text">
  <input class="dads-input-text__input" id="name" type="text" data-size="md" placeholder="入力例" />
</span>

<span class="dads-textarea">
  <textarea class="dads-textarea__textarea" id="memo" rows="4" placeholder="詳細を入力"></textarea>
</span>
```

## Button (`button`)

`data-type`: `solid-fill` | `outline` | `text` / `data-size`: `lg` | `md` | `sm` | `xs`

```html
<button type="button" class="dads-button" data-size="md" data-type="outline">キャンセル</button>
<button type="submit" class="dads-button" data-size="md" data-type="solid-fill">保存する</button>
```

## Checkbox (`checkbox`)

```html
<label class="dads-checkbox" data-size="md">
  <span class="dads-checkbox__checkbox">
    <input class="dads-checkbox__input" type="checkbox" checked />
  </span>
  <span class="dads-checkbox__label">利用規約に同意する</span>
</label>
```

## Official Table (`table`)

Always wrap `.dads-table__table` inside `.dads-table`. Add `data-num` on numeric `th`/`td` cells for right-aligned `tabular-nums`.

```html
<div class="dads-table" data-size="dense" data-row-hover-highlight style="width: 100%">
  <table class="dads-table__table" style="width: 100%" data-cell-border="bottom">
    <thead>
      <tr>
        <th class="dads-table__col-header">項目</th>
        <th class="dads-table__col-header" data-num>金額</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Team プラン</td>
        <td data-num>¥4,950</td>
      </tr>
    </tbody>
  </table>
</div>
```

## Accordion (`accordion`)

```html
<details class="dads-accordion__item-details">
  <summary class="dads-accordion__item-summary">
    <span class="dads-accordion__item-header">よくある質問のタイトル</span>
  </summary>
  <div class="dads-accordion__item-content">
    <p>回答の本文をここに記述します。</p>
  </div>
</details>
```
