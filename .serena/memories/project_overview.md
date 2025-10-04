# OpenNext Demo プロジェクト概要

## プロジェクトの目的
- Next.js 15.5.0 + SST (Serverless Stack) を使用したサーバーレスWebアプリケーションのデモプロジェクト
- App Router、Turbopack、TailwindCSS v4を採用

## 技術スタック
### フロントエンド
- Next.js 15.5.0 (App Router使用、Turbopack有効)
- React 19.1.0
- TypeScript 5.x
- TailwindCSS v4 + PostCSS

### データベース
- PostgreSQL (Docker)
- Drizzle ORM

### テスト
- Vitest (単体テスト)
- Playwright (E2Eテスト)
- テスト環境: jsdom
- セットアップファイル: `test/setup.ts`

### インフラ・デプロイ
- SST (Serverless Stack) 3.17.10
- AWS Lambda + CloudFront

### コード品質
- Biome 2.2.0 (リンタ・フォーマッタ)

## テスト戦略
- `npm run test`でVitestを使用してテスト実行
- テスト環境はjsdomで構成
- セットアップファイル: `test/setup.ts`
- テストはコンポーネントと同じ場所に配置（例：`app/page.test.tsx`）
- テストはAAAパターン（Arrange, Act, Assert）で記述
- 詳細は`docs/testing/frontend-unit-testing.md`を参照

## アーキテクチャ
- App Routerを使用したNext.jsアプリケーション
- srcディレクトリ構造
- @/* パスエイリアス (./src/* にマッピング)
- Geist フォントファミリーの使用
- Server Components優先設計
- PostgreSQL + Drizzle ORMによるデータ管理

## プロジェクト構成
```
/
├── src/app/          # App Router構造
│   ├── layout.tsx    # ルートレイアウト
│   ├── page.tsx      # ホームページ
│   ├── globals.css   # グローバルCSS
│   └── favicon.ico   # ファビコン
├── docs/             # ドキュメント（Next.js原理ガイド等）
├── test/             # テスト設定・ユーティリティ
│   └── setup.ts      # Vitestセットアップ
├── public/           # 静的ファイル
├── scripts/          # スクリプト
├── package.json      # 依存関係とスクリプト
├── tsconfig.json     # TypeScript設定
├── biome.json        # Biome設定
├── vitest.config.ts  # Vitestテスト設定
├── sst.config.ts     # SST設定
├── drizzle.config.ts # Drizzle ORM設定
├── docker-compose.yml # PostgreSQL環境
└── next.config.ts    # Next.js設定
```