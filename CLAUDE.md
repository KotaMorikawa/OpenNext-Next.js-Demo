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

### テスト戦略
- `npm run test`でVitestを使用してテスト
- テスト環境はjsdomで構成
- セットアップファイル: `test/setup.ts`
- テストはコンポーネントと同じ場所に配置（例：`app/page.test.tsx`）
- テストはAAAパターン（Arrange, Act, Assert）で記述
- 詳細は`docs/testing/frontend-unit-testing.md`を参照


## アーキテクチャ

- **フロントエンド**: Next.js App Router + React 19 + TypeScript
- **スタイリング**: TailwindCSS v4 + PostCSS  
- **データベース**: PostgreSQL + Drizzle ORM
- **テスト**: Vitest + Playwright
- **インフラ**: SST 3.17.10 (AWS Lambda + CloudFront)
- **コード品質**: Biome 2.2.0 (Lint + Format)

## コーディング規約

### TypeScript設定
- パスエイリアス: `@/*` → `./src/*`
- Strict mode有効
- Target: ES2017

### Biome設定
- インデント: 2スペース
- 自動インポート整理有効
- Next.js/React推奨ルール適用

## ドキュメント・ナレッジベース
`docs/`ディレクトリには、Next.js App Routerとテストのベストプラクティスドキュメントがあります。

### ドキュメント構成

#### 1. Next.js基本原理ガイド (`nextjs-principle/`)
Next.js App Routerの包括的なガイド（全36章、5部構成）：

**Part 1: データ取得 (11章)**
- **参照タイミング**: データ取得パターンを実装する際
- **主要ファイル**:
  - `part_1_server_components.md` - Server Components設計の基本
  - `part_1_colocation.md` - データ取得の配置戦略
  - `part_1_request_memoization.md` - リクエスト最適化
  - `part_1_concurrent_fetch.md` - 並行データ取得
  - `part_1_data_loader.md` - DataLoaderパターン
  - `part_1_fine_grained_api_design.md` - API設計戦略
  - `part_1_interactive_fetch.md` - インタラクティブなデータ取得

**Part 2: コンポーネント設計 (5章)**
- **参照タイミング**: コンポーネント設計・リファクタリング時
- **主要ファイル**:
  - `part_2_client_components_usecase.md` - Client Components使用指針
  - `part_2_composition_pattern.md` - コンポジションパターン
  - `part_2_container_presentational_pattern.md` - Container/Presentational分離
  - `part_2_container_1st_design.md` - Container優先設計

**Part 3: キャッシュ戦略 (6章)**
- **参照タイミング**: パフォーマンス最適化・キャッシュ制御時
- **主要ファイル**:
  - `part_3_static_rendering_full_route_cache.md` - 静的レンダリング最適化
  - `part_3_dynamic_rendering_data_cache.md` - 動的レンダリング制御
  - `part_3_router_cache.md` - クライアントサイドキャッシュ
  - `part_3_data_mutation.md` - データ変更とキャッシュ無効化
  - `part_3_dynamicio.md` - 実験的キャッシュ改善

**Part 4: レンダリング戦略 (4章)**
- **参照タイミング**: レンダリング最適化・Streaming実装時
- **主要ファイル**:
  - `part_4_pure_server_components.md` - Server Component純粋性
  - `part_4_suspense_and_streaming.md` - プログレッシブローディング
  - `part_4_partial_pre_rendering.md` - 部分的事前レンダリング

**Part 5: その他の実践 (4章)**
- **参照タイミング**: 認証・エラーハンドリング実装時
- **主要ファイル**:
  - `part_5_request_ref.md` - リクエスト・レスポンス参照
  - `part_5_auth.md` - 認証・認可パターン
  - `part_5_error_handling.md` - エラーハンドリング戦略

#### 2. テストドキュメント (`testing/`)
**フロントエンド単体テスト** (`testing/frontend-unit-testing.md`)
- **参照タイミング**: テスト戦略策定・テスト実装時
- **内容**:
  - Classical vs London school テスト手法
  - AAA（Arrange, Act, Assert）パターン
  - Storybookとの統合（`composeStories`）
  - テスト命名規則・共通セットアップパターン

### 参照ガイドライン

**参照タイミング**:
- 実装時には関連するドキュメントを必ず参照する
- ドキュメントを参照したら、「📖{ドキュメント名}を読み込みました」と出力すること

**機能実装時の参照優先順位**:
1. **データ取得実装** → Part 1のドキュメント群を参照
2. **コンポーネント設計** → Part 2のパターンを適用
3. **パフォーマンス最適化** → Part 3のキャッシュ戦略を活用
4. **レンダリング最適化** → Part 4のStreaming・PPR戦略を参照
5. **認証・エラーハンドリング** → Part 5の実践パターンを適用
6. **テスト実装** → `testing/frontend-unit-testing.md`を参照

### 重要な設計原則

- **Server-First**: Server Componentsを優先し、必要時にClient Componentsを使用
- **データ取得の配置**: データを使用するコンポーネントの近くでデータ取得を実行
- **コンポジション**: 適切なコンポーネント分離とコンポジションパターンの活用
- **プログレッシブ強化**: JavaScript無効時でも機能する設計を心がける