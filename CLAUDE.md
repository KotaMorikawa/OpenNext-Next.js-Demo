# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Next.js 15.5.0 + SST (Serverless Stack) を使用したサーバーレスWebアプリケーションのデモプロジェクト。App Router、Turbopack、TailwindCSS v4を採用。

## 必須開発コマンド

### データベース管理
```bash
npm run db:up        # PostgreSQL起動 (Docker)
npm run db:down      # PostgreSQL停止
npm run db:logs      # データベースログ確認
npm run db:studio    # Drizzle Studio (GUI)
npm run db:push      # スキーマ適用
```

### 開発・ビルド
```bash
npm run dev          # 開発サーバー起動 (Turbopack使用)
npm run build        # 本番ビルド (Turbopack使用)
npm run start        # 本番ビルドの実行
```

### テスト
```bash
npm run test         # Vitest実行
npm run test:ui      # Vitest UI
npm run test:e2e     # Playwright E2E
npm run test:coverage # カバレッジ付き
```

### コード品質管理
```bash
npm run lint         # Biomeリント実行
npm run format       # Biomeフォーマット実行
npm run typecheck    # TypeScript型チェック
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
- **データベース**: PostgreSQL + Drizzle ORM
- **テスト**: Vitest + Playwright
- **インフラ**: SST 3.17.10 (AWS Lambda + CloudFront)
- **コード品質**: Biome 2.2.0 (Lint + Format)

### ディレクトリ構造
```
src/
├── app/            # App Router構造
│   ├── layout.tsx  # ルートレイアウト
│   ├── page.tsx    # ホームページ
│   ├── globals.css # グローバルCSS
│   └── favicon.ico # ファビコン
├── lib/
│   ├── db/         # データベース (Drizzle ORM)
│   │   ├── schema.ts
│   │   └── index.ts
│   └── ...
└── components/     # React コンポーネント

scripts/            # データベース初期化スクリプト
test/               # テスト設定
docs/               # プロジェクドキュメント
public/             # 静的ファイル
docker-compose.yml  # PostgreSQL環境
drizzle.config.ts   # Drizzle設定
sst.config.ts       # SST設定
TASK.md            # 機能検証タスクリスト
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
1. `npm run db:up` でPostgreSQL起動
2. `npm run dev` で開発サーバー起動
3. コード変更後:
   - `npm run lint` でエラーがないことを確認
   - `npm run typecheck` で型チェック
   - `npm run test` でテスト実行
   - `npm run build` でビルドが成功することを確認
4. Git操作前に上記チェック必須

### Next.js v15機能検証
- **Phase 1**: ローカル開発 (`npm run dev`)
- **Phase 2**: SST開発環境 (`sst dev`)  
- **Phase 3**: 本番環境 (`sst deploy`)
- 詳細: `TASK.md` 参照

### フォントシステム
Geistフォントファミリーを使用（next/font経由で最適化）

## 模範的ディレクトリ構成原則

### コンポーネント配置戦略

#### 1. プライベートフォルダ規約（`_`プレフィックス）
```
_components/    # そのルートでのみ使用するローカルコンポーネント
_containers/    # Container/Presentationalパターンの実装
_lib/          # ルート固有のユーティリティやヘルパー
```

#### 2. Container/Presentationalパターン
```
_containers/
└── feature-name/
    ├── index.tsx           # エクスポート専用
    ├── container.tsx       # ビジネスロジック・状態管理
    └── presentational.tsx  # UI表現・プロップス受け取り
```

#### 3. ファイル配置の判断基準

**ローカルコンポーネント（`_components/`）の配置基準：**
- そのルートでのみ使用
- 特定の機能に密結合
- 他のルートでの再利用が想定されない

**共通コンポーネント（`src/components/`）の配置基準：**
- 複数のルートで使用
- 汎用的なUI要素（Header、Footer、Navigationなど）
- プロジェクト全体で統一されたデザインシステム

**ユーティリティ（`_lib/`）の配置基準：**
- そのルート固有のデータ取得ロジック
- ルート固有のバリデーション
- 特定の機能領域に特化したヘルパー

**`_lib/` 内部の推奨ディレクトリ構成：**
```
_lib/
├── fetchers/       # データ取得ロジック
├── actions/        # Server Actions・フォームアクション
├── validators/     # バリデーションルール
├── utils/          # ヘルパー関数
└── types/          # ルート固有の型定義
```

### App Router高度機能の活用

#### 並列ルート（`@`プレフィックス）
```
dashboard/
├── @sidebar/       # サイドバー並列ルート
├── @modal/         # モーダル並列ルート
├── layout.tsx      # 並列ルートを統合
└── page.tsx        # メインコンテンツ
```

#### 動的ルート配置
```
posts/
├── [id]/           # 動的ルート
├── _containers/    # posts機能専用コンテナ
├── _lib/          # posts機能専用ユーティリティ
└── page.tsx       # 一覧ページ
```

### 段階的詳細化の原則

**ファイル構成の階層**：
1. `index.tsx` - 機能のエントリーポイント
2. `container.tsx` - ビジネスロジックと状態管理
3. `presentational.tsx` - UI表現とプロップス

**ディレクトリ構成の階層**：
1. ルートレベル（`src/app/feature/`）
2. 機能分割（`_containers/specific-feature/`）
3. 実装詳細（`container.tsx`, `presentational.tsx`）

### ドキュメント駆動開発

#### プロジェクト指針ファイル
```
docs/               # 設計原則・開発指針
CLAUDE.md          # AI開発支援ガイド
README.md          # プロジェクト概要
TASK.md           # 機能検証タスクリスト
```

#### 配置の判断基準
- **技術的詳細** → `docs/`
- **開発ワークフロー** → `CLAUDE.md`
- **プロジェクト概要** → `README.md`
- **進捗管理** → `TASK.md`

### 開発時の配置判断フロー

```
新しいファイルを作成する際の判断：

1. 既存のルートで使用？
   ├─ Yes → そのルートの_components/へ
   └─ No → 2へ

2. 複数のルートで使用予定？
   ├─ Yes → src/components/へ
   └─ No → そのルートの_components/へ

3. ビジネスロジックを含む？
   ├─ Yes → _containers/でContainer/Presentational分離
   └─ No → _components/でシンプルなコンポーネント

4. データ取得やユーティリティ？
   ├─ ルート固有 → _lib/へ
   └─ 汎用的 → src/lib/へ
```