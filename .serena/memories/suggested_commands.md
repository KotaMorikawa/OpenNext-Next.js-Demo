# 推奨開発コマンド

## データベース管理

### PostgreSQL操作（Docker）
```bash
npm run db:up        # PostgreSQL起動 (Docker)
npm run db:down      # PostgreSQL停止
npm run db:logs      # データベースログ確認
npm run db:studio    # Drizzle Studio (GUI) - データベース管理画面
npm run db:push      # スキーマ適用
```

## 開発・ビルド

### 開発サーバー
```bash
npm run dev          # Next.js開発サーバーをTurbopackで起動 (localhost:3000)
```

### ビルド・デプロイ
```bash
npm run build        # Next.js本番ビルド（Turbopack使用）
npm run start        # 本番ビルドの実行
```

## テスト

### 単体テスト・E2Eテスト
```bash
npm run test         # Vitest実行
npm run test:ui      # Vitest UI
npm run test:e2e     # Playwright E2E
npm run test:coverage # カバレッジ付き
```

## コード品質管理

### リント・フォーマット
```bash
npm run lint         # Biomeによるリント実行
npm run format       # Biomeによるフォーマット実行
```

### 型チェック
```bash
npm run typecheck    # TypeScriptの型チェック
```

## SST (Serverless Stack) 関連
```bash
sst dev              # SST開発環境
sst deploy           # AWSにデプロイ
sst remove           # AWSリソース削除
```

## Git操作 (macOS)
```bash
git status           # ステータス確認
git add .            # 全ファイル追加
git commit -m "message"  # コミット
git push             # プッシュ
```

## システムユーティリティ (macOS)
```bash
ls -la               # ファイル一覧（詳細表示）
cd <directory>       # ディレクトリ移動
grep -r <pattern> <path>  # 文字列検索
find <path> -name <pattern>  # ファイル検索
```

## タスク完了時の必須チェック
1. `npm run lint` - エラーなしを確認
2. `npm run typecheck` - 型エラーなしを確認
3. `npm run build` - ビルド成功を確認
4. `npm run test` - すべてのテストがパス（テストがある場合）
5. 手動動作確認
6. Git操作でコミット