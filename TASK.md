# Next.js v15 機能検証タスクリスト

## プロジェクト概要
Next.js v15の安定機能をSSTでデプロイしたAWSインフラで実現できることを検証するためのプロジェクト。各機能の実装可能性と制約事項を明確にする。

## 検証対象のNext.js v15機能

### 1. Core機能 (🔥 高優先度)

#### 1.1 App Router基本機能
- [ ] App Router基本構造の実装
- [ ] ページルーティング（静的・動的）
- [ ] レイアウトシステム（ネスト対応）
- [ ] loading.tsx、error.tsx、not-found.tsx
- [ ] 並行ルート（@modal等）

#### 1.2 Server/Client Components
- [ ] Server Componentsの実装
- [ ] Client Componentsの実装
- [ ] コンポーネント境界の検証
- [ ] "use client"ディレクティブの動作確認
- [ ] Server Componentsでのデータフェッチ

#### 1.3 React 19対応
- [ ] React 19の基本機能利用
- [ ] useActionState()の実装
- [ ] form Action属性の利用
- [ ] React 19新機能の動作確認

#### 1.4 TypeScript設定
- [ ] next.config.tsの利用
- [ ] TypeScript strict mode
- [ ] パスエイリアス（@/*）の動作確認

### 2. データフェッチング機能 (🔥 高優先度)

#### 2.1 非同期Request API
- [ ] cookies()の非同期化対応
- [ ] headers()の非同期化対応  
- [ ] draftMode()の非同期化対応
- [ ] connection()ユーティリティの利用

#### 2.2 Dynamic API
- [ ] paramsの非同期化対応
- [ ] searchParamsの非同期化対応
- [ ] generateMetadata()での非同期params/searchParams
- [ ] awaitでの適切な処理

#### 2.3 Request Memoization
- [ ] 同一リクエストの自動メモ化確認
- [ ] データフェッチ層の分離実装
- [ ] server-onlyパッケージの利用

#### 2.4 Server Actions
- [ ] Server Actionsの基本実装
- [ ] フォーム操作との統合
- [ ] revalidateTag()、revalidatePath()
- [ ] エラーハンドリング
- [ ] Progressive Enhancement

### 3. キャッシュシステム (⚡ 中優先度)

#### 3.1 Data Cache
- [ ] fetch()のキャッシュオプション
- [ ] cache: 'force-cache'の実装
- [ ] fetchCache設定の動作確認
- [ ] revalidate設定のテスト

#### 3.2 Full Route Cache
- [ ] 静的生成の動作確認
- [ ] force-staticの実装
- [ ] revalidateの設定と動作

#### 3.3 Router Cache
- [ ] staleTimes設定の実装
- [ ] クライアント側キャッシュの制御
- [ ] router.refresh()の動作

### 4. レンダリング機能 (⚡ 中優先度)

#### 4.1 Streaming SSR
- [ ] Suspenseを使ったStreaming
- [ ] loading.tsxでのfallback表示
- [ ] 段階的レンダリングの確認

#### 4.2 Partial Pre-Rendering (実験的)
- [ ] experimental.ppr設定
- [ ] SuspenseによるStatic/Dynamic境界
- [ ] CloudFrontでの動作確認

#### 4.3 Static Generation
- [ ] 改善された静的生成性能
- [ ] generateStaticParams()
- [ ] ISRの実装可能性


### 5. インフラ機能 (🌐 高優先度)

#### 5.1 Middleware
- [ ] 基本的なMiddleware実装

#### 5.2 API Routes
- [ ] Route Handlersの実装
- [ ] GET/POST/PUT/DELETEメソッド
- [ ] レスポンスキャッシングの設定


### 6. 開発者体験 (🛠 低優先度)

#### 6.1 ESLint 9対応
- [ ] ESLint 9の設定と動作確認
- [ ] eslint-config-next@latestの利用

#### 6.2 エラーハンドリング
- [ ] error.tsxの実装パターン
- [ ] グローバルエラーハンドリング
- [ ] カスタム404ページ

#### 6.3 認証・認可
- [ ] Cookie JWTパターンの実装
- [ ] ページレベルでの認可確認

### 7. SST/AWS固有検証項目 (☁️ 高優先度)

#### 7.1 Lambda統合
- [ ] Server Componentsのサーバーレス実行
- [ ] Server Actionsのサーバーレス実行
- [ ] コールドスタートの影響確認

#### 7.2 CloudFront統合
- [ ] 静的アセットの配信
- [ ] Cache-Controlヘッダー設定
- [ ] エッジでのレスポンス最適化

#### 7.3 S3統合
- [ ] 静的ファイルのS3配信
- [ ] next/imageとの統合
- [ ] アセットのバージョニング

#### 7.4 DynamoDB統合
- [ ] Data Cacheの永続化検討
- [ ] セッション管理での利用
- [ ] キャッシュ無効化戦略

#### 7.5 セキュリティ
- [ ] IAM権限の最小化
- [ ] VPC設定（必要に応じて）
- [ ] シークレット管理

## 実装フェーズ

### Phase 1: 基本機能確認
- App Router基本構造
- Server/Client Components
- データフェッチング基本

### Phase 2: 高度機能実装
- キャッシュシステム
- Server Actions
- Streaming SSR

### Phase 3: 最適化とAWS統合
- 画像・フォント最適化
- Middleware実装
- AWS固有機能検証

### Phase 4: 本番環境対応
- 監視・ログ設定
- セキュリティ強化
- パフォーマンス最適化

## 成功指標

### 機能動作確認
- [ ] 各機能がローカル開発環境で正常動作
- [ ] AWS本番環境で正常動作
- [ ] パフォーマンス要件を満たす

### 制約事項の明確化
- [ ] AWS制約による利用不可機能の特定
- [ ] 代替案の実装可能性確認
- [ ] コスト影響の評価

### ドキュメント作成
- [ ] 各機能の実装手順書
- [ ] AWSデプロイガイド
- [ ] 制約事項とベストプラクティス

## 検証結果記録

各タスク完了時に以下を記録：
- ✅ 成功: 期待通り動作
- ⚠️ 制限付き: 一部制約あり
- ❌ 失敗: 実装不可/重大な問題
- 📝 備考: 追加情報や回避策

## リファレンス

- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
- [SST Documentation](https://sst.dev/)
- [AWS Lambda Limitations](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html)
- [プロジェクトドキュメント](./docs/)