# 推奨開発コマンド

## 基本開発コマンド

### 開発サーバー
```bash
npm run dev
# Next.js開発サーバーをTurbopackで起動 (localhost:3000)
```

### ビルド・デプロイ
```bash
npm run build    # Next.js本番ビルド（Turbopack使用）
npm run start    # 本番ビルドの実行
```

## コード品質管理

### リント・フォーマット
```bash
npm run lint     # Biomeによるリント実行
npm run format   # Biomeによるフォーマット実行
```

### 型チェック
```bash
npx tsc --noEmit  # TypeScriptの型チェック（noEmitモード）
```

## SST (Serverless Stack) 関連
```bash
sst dev          # SST開発環境
sst deploy       # AWSにデプロイ
sst remove       # AWSリソース削除
```

## Git操作 (macOS)
```bash
git status       # ステータス確認
git add .        # 全ファイル追加
git commit -m "message"  # コミット
git push         # プッシュ
```

## システムユーティリティ (macOS)
```bash
ls -la          # ファイル一覧（詳細表示）
cd <directory>  # ディレクトリ移動
grep -r <pattern> <path>  # 文字列検索
find <path> -name <pattern>  # ファイル検索
```

## タスク完了時の必須チェック
1. `npm run lint` - エラーなしを確認
2. `npm run build` - ビルド成功を確認
3. 手動動作確認
4. Git操作でコミット