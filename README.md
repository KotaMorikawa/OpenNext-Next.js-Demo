# Next.js v15 Feature Demo

Next.js v15の機能をSST (Serverless Stack)でAWSにデプロイし、各機能の検証を行うデモプロジェクト。

## Tech Stack

- **Next.js 15.5.0** (App Router + Turbopack)
- **React 19** (Server/Client Components)
- **TypeScript 5**
- **PostgreSQL** (Drizzle ORM)
- **SST 3.17.10** (AWS デプロイ)
- **Vitest + Playwright** (テスト)

## Getting Started

### 1. 環境変数の設定

```bash
cp .env.example .env.local
```

### 2. データベースの起動

```bash
# PostgreSQL を Docker で起動
npm run db:up

# データベースログの確認
npm run db:logs
```

### 3. 開発サーバーの起動

```bash
# Next.js 開発サーバー起動
npm run dev
```

### 4. その他のコマンド

```bash
# テスト実行
npm run test              # Vitest
npm run test:ui           # Vitest UI
npm run test:e2e          # Playwright E2E

# データベース管理
npm run db:studio         # Drizzle Studio (GUI)
npm run db:push           # スキーマ適用

# コード品質
npm run lint              # Biome リント
npm run typecheck         # TypeScript 型チェック
```

## Project Structure

```
src/
├── app/                 # App Router (Next.js 15)
├── lib/
│   ├── db/             # Database (Drizzle ORM)
│   └── ...
├── components/         # React コンポーネント
└── ...

scripts/                # データベース初期化
test/                   # テスト設定
TASK.md                # 機能検証タスクリスト
```

## 開発指針とディレクトリ構成原則

### ファイル配置の基本ルール

#### プライベートフォルダ規約（`_`プレフィックス）
- `_components/` - そのルートでのみ使用するローカルコンポーネント
- `_containers/` - Container/Presentationalパターンの実装
- `_lib/` - ルート固有のユーティリティやヘルパー
  - `fetchers/` - データ取得ロジック
  - `actions/` - Server Actions・フォームアクション
  - `validators/` - バリデーションルール
  - `utils/` - ヘルパー関数
  - `types/` - ルート固有の型定義

#### Container/Presentationalパターン
```
_containers/feature-name/
├── index.tsx           # エクスポート専用
├── container.tsx       # ビジネスロジック・状態管理
└── presentational.tsx  # UI表現・プロップス受け取り
```

#### 配置判断フロー
1. **既存ルートで使用** → そのルートの`_components/`
2. **複数ルートで使用** → `src/components/`
3. **ビジネスロジック含む** → `_containers/`でContainer/Presentational分離
4. **データ取得・ユーティリティ** → ルート固有なら`_lib/`、汎用なら`src/lib/`

### App Router高度機能の活用
- **並列ルート**: `@sidebar/`, `@modal/` など
- **動的ルート**: `[id]/` と機能固有フォルダの組み合わせ
- **コロケーション**: 関連するすべてのファイルを近くに配置

詳細な設計原則は `CLAUDE.md` を参照してください。

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!