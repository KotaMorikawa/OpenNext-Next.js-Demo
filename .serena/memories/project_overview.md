# OpenNext Demo プロジェクト概要

## プロジェクトの目的
- Next.js + SST (Serverless Stack) を使用したWebアプリケーションのデモプロジェクト
- create-next-appをベースにしたNext.jsアプリケーション
- AWSでサーバーレス環境にデプロイすることを想定

## 技術スタック
### フロントエンド
- Next.js 15.5.0 (App Router使用、Turbopack有効)
- React 19.1.0
- TypeScript 5.x
- TailwindCSS v4

### インフラ・デプロイ
- SST (Serverless Stack) 3.17.10
- AWS (本番環境)

### 開発ツール
- Biome 2.2.0 (リンタ・フォーマッタ)
- PostCSS

## アーキテクチャ
- App Routerを使用したNext.jsアプリケーション
- srcディレクトリ構造
- @/* パスエイリアス (./src/* にマッピング)
- Geist フォントファミリーの使用

## プロジェクト構成
```
/
├── src/app/          # App Router構造
│   ├── layout.tsx    # ルートレイアウト
│   ├── page.tsx      # ホームページ
│   ├── globals.css   # グローバルCSS
│   └── favicon.ico   # ファビコン
├── docs/             # ドキュメント
├── public/           # 静的ファイル
├── package.json      # 依存関係とスクリプト
├── tsconfig.json     # TypeScript設定
├── biome.json        # Biome設定
├── sst.config.ts     # SST設定
└── next.config.ts    # Next.js設定
```