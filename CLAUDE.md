# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Next.js 15.5.0 + SST (Serverless Stack) を使用したサーバーレスWebアプリケーションのデモプロジェクト。App Router、Turbopack、TailwindCSS v4を採用。

## 必須開発コマンド

### 開発・ビルド
```bash
npm run dev          # 開発サーバー起動 (Turbopack使用)
npm run build        # 本番ビルド (Turbopack使用)
npm run start        # 本番ビルドの実行
```

### コード品質管理
```bash
npm run lint         # Biomeリント実行
npm run format       # Biomeフォーマット実行
npx tsc --noEmit     # TypeScript型チェック
```

### デプロイ (SST)
```bash
sst dev             # SST開発環境
sst deploy          # AWSデプロイ
sst remove          # AWSリソース削除
```

## アーキテクチャ

- **フロントエンド**: Next.js App Router + React 19 + TypeScript
- **スタイリング**: TailwindCSS v4 + PostCSS
- **インフラ**: SST 3.17.10 (AWS Lambda + CloudFront)
- **コード品質**: Biome 2.2.0 (Lint + Format)

### ディレクトリ構造
```
src/app/            # App Router構造
├── layout.tsx      # ルートレイアウト
├── page.tsx        # ホームページ
├── globals.css     # グローバルCSS
└── favicon.ico     # ファビコン
docs/               # プロジェクドキュメント
public/             # 静的ファイル
sst.config.ts       # SST設定
```

## コーディング規約

### TypeScript設定
- パスエイリアス: `@/*` → `./src/*`
- Strict mode有効
- Target: ES2017

### Biome設定
- インデント: 2スペース
- 自動インポート整理有効
- Next.js/React推奨ルール適用

## 重要な注意点

### SST設定
- 本番環境: リソース保護有効 (`protect: true`)
- ステージング環境: 自動削除設定 (`removal: "remove"`)

### 開発フロー
1. `npm run lint` でエラーがないことを確認
2. `npm run build` でビルドが成功することを確認
3. Git操作前に上記チェック必須

### フォントシステム
Geistフォントファミリーを使用（next/font経由で最適化）