# WISBOX ご利用案内サイト（wisbox.jp）

WISBOX スマートロッカーの利用者向け・施設向け案内サイトです。Next.js の静的書き出し（`output: "export"`）で `out/` に HTML を生成し、GitHub Pages で公開します。

## 開発

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # out/ に静的ファイルを生成
```

## 公開の仕組み

- `main` ブランチに push すると、GitHub Actions（`.github/workflows/pages.yml`）がビルドして GitHub Pages に公開します。
- 独自ドメインは `public/CNAME`（wisbox.jp）。DNS は Xserver ドメインで設定します（apex に GitHub Pages の A レコード 4 件、`www` に `<アカウント>.github.io` の CNAME）。
- お問い合わせフォームは静的サイトから WISBOX LP の受付 API（既定：`https://wisbox-smartlocker-lp.kylon.app/api/inquiries`、`https://wisbox.jp` からの呼び出しを許可）へ直接送信します。LP 側で保存し、会社のメールに通知します。変更する場合はビルド時に `NEXT_PUBLIC_INQUIRY_ENDPOINT`（中継 API を使う場合は `NEXT_PUBLIC_INQUIRY_FORMAT=relay` も）を指定してください。フォームが mailto に切り替わることはありません。

## 主なファイル

- `app/` … ページ（`/`、`/business`、`/tokusho`、`/terms`、`/privacy`）
- `components/site/` … ヘッダー、フッター、ロボット（SVG）など
- `public/wisbox-robot.js` … ロボットの動き（Web Animations API）
- `public/wisbox-inquiry.js` … お問い合わせフォーム（入力 → 確認 → 送信 → 受付完了）
- `lib/content/legal-html.ts` … 利用規約・プライバシーポリシー本文
