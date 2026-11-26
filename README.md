# Artifact Share Agent Skills (`artifactshare/skills`)

[Artifact Share](https://artifactshare.com) が提供する公式 Agent Skills コレクションです。
第 1 弾として、デジタル庁デザインシステム（DADS）公式トークン（`@digital-go-jp/design-tokens@2.1.0`）、公式 HTML コンポーネント全 43 種（`design-system-example-components-html`）、および「ダッシュボードデザインの実践ガイドブック」2026 年版 7 色テーマに完全準拠した、日本実務向け HTML 生成スキルパック（`dads-*`）を収録しています。

AI 特有の装飾過多（AI スロップ）を構造的に排除し、そのまま会議・レビュー・全社共有に出せる日本語のドキュメント・ダッシュボード・スライド・動く UI モックをゼロ依存の単一 HTML として生成します。

## ライブデモ（Artifact Share で公開中）

- **DADS Agent Skills ライブショーケース**：https://c3t9kij22u.artifactshare.link/
  - ビジネス向け 3 本（KPI ダッシュボード / 社内ルール・制度ガイド / 社内 MTG スライド）＋開発向け 3 本（PR レビューガイド / 動く業務 UI モック / 技術発表スライド）を 1 画面で操作し、公式 7 色パレットをリアルタイムに切り替えられます。

## インストール・対応ツール

### 1. ローカル AI ツール（Claude Code / Codex / GitHub Copilot / Cursor / Gemini CLI / Antigravity）

```sh
npx skills add artifactshare/skills
```

特定のスキルだけ導入する場合：

```sh
npx skills add artifactshare/skills@dads-doc
npx skills add artifactshare/skills@dads-dashboard
npx skills add artifactshare/skills@dads-slides
npx skills add artifactshare/skills@dads-mockup
```

- **Claude Code Plugin Marketplace**：`/plugin marketplace add artifactshare/skills`
- **GitHub Copilot（VS Code / Visual Studio / JetBrains / CLI）**：`.github/skills/`・`~/.copilot/skills/`・`.claude/skills/`・`.agents/skills/` に対応しているため、上記 `npx skills add` でそのまま利用できます。

### 2. Web / クラウド AI（`gemini.google.com` / Gemini in Chrome / Claude.ai）

ローカルの Node.js を実行できない Web / クラウド AI 向けに、**スクリプト不要（`.js` ゼロ）・Markdown テンプレート同梱の `.zip` パッケージ** を [GitHub Releases](https://github.com/artifactshare/skills/releases/latest) で配布しています。

- **おすすめ（4 種全部入り）**：`dads-all-in-one-web.zip`（1 パックでドキュメント・ダッシュボード・スライド・UI モックのすべてを生成可能）
- **個別版**：`dads-doc-web.zip` / `dads-dashboard-web.zip` / `dads-slides-web.zip` / `dads-mockup-web.zip`

| サービス | 導入手順 |
|---|---|
| **`gemini.google.com`（Skills）** | 左メニュー「カスタマイズ（Customize）」→「Skills」→「作成 / アップロード」から `.zip` をアップロード。チャットで `/` や `@`、または「DADS で〜」と呼び出し（生成 HTML は **Canvas** で即プレビュー可能）。 |
| **`gemini.google.com`（Gems）** | `.zip` を展開し、`SKILL.md` を「指示」に貼り、`references/*.md` を「知識」に添付して保存。**Google Drive 経由で共有リンクを発行**すれば社内全員がインストール不要で利用できます。 |
| **Gemini in Chrome** | `chrome://skills` から展開したフォルダをインポート（実行スクリプトを含まないため制限に抵触しません）。 |
| **Claude.ai（Web）** | Projects のカスタム指示・ナレッジ、または Skills に `.zip` / 展開ファイルをアップロードして利用できます。 |

## 同梱スキル一覧

| スキル | 用途 | 主な機能 |
|---|---|---|
| [`dads-doc`](skills/dads-doc/SKILL.md) | 技術検討レポート、PR 内容説明、社内ガイド、議事録 | スクロール連動目次自動生成、日本語文字組み（`palt` / `auto-phrase` / `text-autospace`）、A4 印刷最適化、公式 43 コンポーネント自動バンドル |
| [`dads-dashboard`](skills/dads-dashboard/SKILL.md) | KPI 定点モニター、月次・日次分析、事業計画ダッシュボード | 公式 2026 年版 7 色パレット（白地 `#FFFFFF`＋ボーダーレス `#F8F8FB` パネル）、パレット別 KPI Good/Bad 配色、横棒・積み上げ棒・SVG 折れ線チャート |
| [`dads-slides`](skills/dads-slides/SKILL.md) | 技術発表、社内共有会、方針説明スライド | ゼロ依存 16:9 固定比率、キーボード操作（`←` / `→` / `Space`）、URL ハッシュ同期、1 枚 1 ページ PDF 印刷 |
| [`dads-mockup`](skills/dads-mockup/SKILL.md) | 業務画面プロトタイプ、申請フォーム、社内ツール UI モック | 公式 DADS フォーム・テーブル・ボタン・通知バナー全 43 種の自動ツリーシェイク・バンドル、インタラクティブタブ切替 |

## 特徴

- **完全自己完結パッケージ**：各スキルは `scripts/bundle.mjs` と公式アセットを同梱しているため、単体インストールしても外部依存なしで動作します。
- **自動ツリーシェイク**：本文 HTML で使われた `.dads-*` クラスを検出し、必要な公式コンポーネント CSS だけを単一 HTML へバンドルします。
- **チーム・プロジェクト単位のテーマ上書き**：`--palette`（公式 7 色）および `--theme custom.css` で自社ブランドカラーやロゴを上書きできます。
- **Artifact Share との親和性**：生成した単一 HTML はローカルで完結して動作しますが、[Artifact Share](https://artifactshare.com)（`as` CLI / MCP）と組み合わせることで、デプロイなしで社内限定 URL 共有・スマホ確認・コメント回収・同じ URL でのバージョン更新まで一貫して回せます。

## 開発・検証

```sh
npm run sync:official   # デジタル庁公式 3 資産を vendor/ へ同期
npm run build:skills    # 全 4 スキルを自己完結パッケージへビルド
npm run build:web       # Web / クラウド AI 向けスクリプトなし .zip を dist/web-skills/ へ生成
npm run build:samples   # サンプル HTML を生成
npm run validate        # ドリフト検証 + ユニットテスト
```

## 謝辞・出典・ライセンス（デジタル庁デザインシステムへのリスペクト）

本リポジトリの `dads-*` スキルパックは、デジタル庁がオープンに公開・保守されている以下の優れたデザイン資産とガイドラインに深く敬意を表し、それぞれのライセンスに従って利用・同梱しています。アクセシブルで読みやすい日本語 Web の基盤を整備・公開してくださったデジタル庁および関係者の皆さまに感謝いたします。

- **[@digital-go-jp/design-tokens](https://www.npmjs.com/package/@digital-go-jp/design-tokens)**（v2.1.0）— MIT License（`vendor/dads-design-tokens/LICENSE` 同梱）
- **[digital-go-jp/design-system-example-components-html](https://github.com/digital-go-jp/design-system-example-components-html)**（全 43 コンポーネント）— MIT License（`vendor/dads-components/LICENSE` 同梱）
- **[digital-go-jp/policy-dashboard-assets](https://github.com/digital-go-jp/policy-dashboard-assets)**（「ダッシュボードデザインの実践ガイドブック」および 2026 年版 7 色デザインテンプレート）

> 本リポジトリは Artifact Share が公開する独立したオープンソースプロジェクトであり、デジタル庁の公式提供・推奨物ではありません。

本リポジトリ独自のコード・ドキュメント・スキル定義は **MIT License**（[LICENSE](LICENSE)）のもとで公開しています。
