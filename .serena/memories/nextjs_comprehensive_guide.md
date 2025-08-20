# Next.js App Router 設計原則 - 包括的ガイド

## 概要
このドキュメントは Next.js v15 系 App Router と React Server Components の根底にある考え方に基づいた設計・プラクティスを包括的にまとめています。**詳細な実装例や深い理解は各参照ファイルを確認してください。**

---

## 第1部: データフェッチ
**基本思想**: サーバーファーストによるデータフェッチ

### Server Componentsでデータフェッチ 
**参照**: `part_1_server_components.md`
- **従来課題**: God API vs Chatty API、実装コスト、バンドルサイズ
- **RSC利点**: 高速バックエンドアクセス、シンプル・セキュア実装、バンドル軽減
- **GraphQLとの関係**: RSCはGraphQLの精神的後継

### データフェッチコロケーション
**参照**: `part_1_colocation.md`
- **原則**: データ使用コンポーネントにフェッチ配置
- **効果**: バケツリレー回避、独立性向上
- **Request Memoization**: 同一リクエスト自動メモ化

### Request Memoization活用
**参照**: `part_1_request_memoization.md`
- **データフェッチ層分離**: 同一URL・オプションでメモ化効果最大化
- **ファイル配置**: `app/products/fetcher.ts`等でコロケーション
- **server-only**: クライアント利用防止

### 並行データフェッチ
**参照**: `part_1_concurrent_fetch.md`
- **コンポーネント分割**: 兄弟関係で並行レンダリング
- **Promise.all()**: 不可分データの並行フェッチ
- **preloadパターン**: Request Memoization活用で親子超越並行処理

### N+1問題解決
**参照**: `part_1_data_loader.md`
- **DataLoader**: GraphQL由来のバッチ処理ライブラリ
- **React.cache()**: ユーザーリクエスト単位でインスタンス生成
- **バッチAPI設計**: `?id=1&id=2&id=3`形式でバックエンド対応

### 細粒度API設計
**参照**: `part_1_fine_grained_api_design.md`
- **App Router適合**: 細粒度APIとRSCの相性良好
- **設計観点**: パフォーマンスより保守性・汎用性重視
- **バックエンドチーム理解**: メリット説明でコロケーション推進

### ユーザー操作データフェッチ
**参照**: `part_1_interactive_fetch.md`
- **Server Actions + useActionState()**: ユーザー操作基づくデータフェッチ
- **URL状態管理**: リロード復元・URLシェア考慮
- **データ操作後再レンダリング**: revalidatePath/Tag活用

---

## 第2部: コンポーネント設計
**基本思想**: Server Components中心設計にClient Components適切統合

### Client Componentsユースケース
**参照**: `part_2_client_components_usecase.md`
- **クライアント処理**: イベントハンドラ、Hooks、ブラウザAPI
- **サードパーティ**: RSC未対応ライブラリ
- **RSC Payload削減**: 大量出力のJSバンドル/転送量トレードオフ

### Compositionパターン
**参照**: `part_2_composition_pattern.md`
- **制約理解**: Client Components はサーバーモジュールimport不可
- **Client Boundary**: `"use client"`依存関係境界
- **children活用**: propsでServer Components渡し可能

### Container-Presentationalパターン
**参照**: `part_2_container_presentational_pattern.md`
- **責務分離**: Container=データ取得、Presentational=表示
- **テスト改善**: RTL/Storybook でPresentational、関数実行でContainer
- **Shared Components**: Client Boundary内外で動作

### Container 1st設計
**参照**: `part_2_container_1st_design.md`
- **設計手順**: Container ツリー→実装→Presentational追加
- **Composition前提**: 最初からCompositionパターン適用
- **ディレクトリ設計**: `_containers/<名前>/index.tsx`構成

---

## 第3部: キャッシュ
**基本思想**: 4層キャッシュ戦略的活用

### データ操作とServer Actions
**参照**: `part_3_data_mutation.md`
- **Server Actions基本**: tRPC等不要、シンプル実装
- **キャッシュrevalidate**: `revalidatePath()/Tag()`でサーバー・クライアント両対応
- **redirect効率化**: RSC Payload含み1往復完結
- **Progressive Enhancement**: JavaScript非動作対応

### Dynamic Rendering + Data Cache
**参照**: `part_3_dynamic_rendering_data_cache.md`
- **Data Cache**: リクエスト・ユーザー超越共有
- **fetch()拡張**: `cache: "force-cache"`, `next.revalidate`, `next.tags`
- **unstable_cache()**: DBアクセス等のキャッシュ（v15非推奨、Dynamic IO移行）

### Static Rendering + Full Route Cache
**参照**: `part_3_static_rendering_full_route_cache.md`
- **デフォルトStatic**: Dynamic APIでDynamic切替
- **revalidate戦略**: オンデマンド・時間ベース
- **パフォーマンス**: 瞬間大量リクエストでも1回レンダリング

### Router Cache
**参照**: `part_3_router_cache.md`
- **staleTimes設定**: `experimental.staleTimes`で期間制御
- **revalidate方法**: `router.refresh()`, Server Actions, Cookie操作
- **複雑挙動**: ブラウザバック、動的・静的期間計算違い

### Dynamic IO（実験機能）
**参照**: `part_3_dynamicio.md`
- **明示的選択**: `<Suspense>`（Dynamic）vs `"use cache"`（Static）
- **キャッシュ戦略**: `cacheTag()`, `cacheLife()` で詳細制御
- **境界ルール**: Dynamic は Static 含可、Static は children 限定

---

## 第4部: レンダリング
**基本思想**: Streaming対応新レンダリングモデル

### Partial Pre-Rendering（実験機能）
**参照**: `part_4_partial_pre_rendering.md`
- **統合モデル**: `<Suspense>`境界でStatic/Dynamic混在
- **1HTTPレスポンス**: Static即応答→Dynamic段階配信
- **CDN課題**: レスポンス単位キャッシュと非相性

### Server Components純粋性
**参照**: `part_4_pure_server_components.md`
- **Request Memoization**: データフェッチ純粋性保持
- **React.cache()**: DBアクセス等メモ化
- **Cookie制約**: Server Components では変更操作不可

### Suspense + Streaming
**参照**: `part_4_suspense_and_streaming.md`
- **重い処理遅延**: `<Suspense>`でTTFB改善
- **Layout Shift**: TTFB vs CLS トレードオフ
- **SEO影響**: Streaming内容もGoogle評価、遅延あるが問題なし

---

## 第5部: その他プラクティス
**基本思想**: App Router特有制約下での実装

### 認証と認可
**参照**: `part_5_auth.md`
- **状態保持**: Cookie JWT または Redis セッション
- **URL認可**: 各ページ `verifySession()`（並行レンダリング制約）
- **データアクセス認可**: フェッチ層で `unauthorized()`, `forbidden()`
- **middleware制約**: edge限定、Node.js API制限

### エラーハンドリング
**参照**: `part_5_error_handling.md`
- **Server Components**: `error.tsx`, `not-found.tsx`でUI定義
- **Server Actions**: 戻り値でエラー表現（UX保持）、throw避ける
- **予測可能/不能**: バリデーションエラー等は戻り値、その他はthrow

### リクエスト参照・レスポンス操作
**参照**: `part_5_request_ref.md`
- **req/res廃止**: 専用API提供
- **情報取得**: `params`, `searchParams`, `headers()`, `cookies()`
- **レスポンス制御**: `notFound()`, `redirect()`, `permanentRedirect()`
- **Streaming制約**: 確実HTTPステータス設定不可、meta代替

---

## フロントエンド単体テスト原則
**参照**: `frontend_unit_testing_principles.md` 

### 基本原則
- **目的**: 退行検出によるセーフティネット、持続可能開発
- **古典学派推奨**: 共有依存のみテストダブル、MSW活用
- **AAAパターン**: Arrange-Act-Assert構造

### 実装パターン
- **Storybook + Jest**: CSF3.0 + composeStories
- **テスト分離**: 実装詳細でなくビジネス要件表現
- **共通化戦略**: Arrange/Act 可、Assert 避ける

---

## 開発ワークフローとの統合
**CLAUDE.md**: 探索-計画-コード-コミット ワークフロー適用
- **TDD適用**: 明確な要件でTDD（デフォルト）
- **Container 1st**: Server Components設計優先
- **ブランチ戦略**: type/description 命名、論理分離コミット
- **品質保証**: lint/build/test 必須通過