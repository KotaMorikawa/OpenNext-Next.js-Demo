# Next.js App Router 設計原則

## 全体概要

このドキュメントはNext.js App RouterとReact Server Componentsの根底にある**考え方**に基づいた設計・プラクティスをまとめたものです。対象読者は「App Routerを使い始めたが本格的な設計で悩んでいる開発者」を想定しています。

**前提**: Next.js v15系、バックエンドAPIを分離するアプローチで解説

## 第1部: データフェッチ

### 基本原則
**データフェッチはServer Componentsで行う**

#### 従来の課題
- **パフォーマンスと設計のトレードオフ**: 
  - God API vs Chatty API問題
  - 通信回数とシンプル設計の矛盾
- **実装コスト**: 3rd party ライブラリ学習、セキュリティ対策
- **バンドルサイズ増加**: クライアント側の冗長なコード

#### Server Componentsの利点
1. **高速なバックエンドアクセス**: サーバー間通信の高速性・安定性
2. **シンプルでセキュアな実装**: 非同期関数でのシンプル実装
3. **バンドルサイズ軽減**: サーバー実行コードはバンドルに含まれない

```tsx
// Server Componentsでのデータフェッチ例
export async function ProductTitle({ id }) {
  const res = await fetch(`https://api.example.com/products/${id}`);
  const product = await res.json();
  return <div>{product.title}</div>;
}
```

### データフェッチコロケーション

**原則**: データを使用するコンポーネントにデータフェッチをコロケーション

#### メリット
- バケツリレー（Props Drilling）の回避
- コンポーネント独立性の向上
- Pages Router時代の認知負荷軽減

#### 実装パターン
```tsx
// ❌ Pages Router パターン（バケツリレー）
function Page({ product }) {
  return <ProductHeader product={product} />;
}

// ✅ App Router パターン（コロケーション）
function Page() {
  return <ProductHeader />; // 自身でデータフェッチ
}

async function ProductHeader() {
  const product = await fetchProduct();
  return <header>{product.name}</header>;
}
```

### Request Memoization

**同一リクエストの重複実行を自動的にメモ化**

#### 設計ポイント
- **データフェッチ層の分離**: 同一URL・オプションでメモ化効果を最大化
- **ファイルコロケーション**: `app/products/fetcher.ts`など
- **server-onlyパッケージ**: クライアント利用防止

```tsx
// データフェッチ層分離例
export async function getProduct(id: string) {
  const res = await fetch(`https://api.example.com/products/${id}`, {
    headers: { 'Authorization': '...' }
  });
  return res.json();
}
```

## 第2部: コンポーネント設計

### 基本思想
**Server ComponentsとClient Componentsの適切な統合**

React Server Componentsの根本課題認識:
> "Reactアプリがクライアント中心で、サーバーを十分に活用していない"

### Client Componentsの適切なユースケース

#### 1. クライアントサイド処理
- イベントハンドラ（`onClick`, `onChange`）
- React Hooks（`useState`, `useEffect`）
- ブラウザAPI利用

#### 2. サードパーティコンポーネント
- UI ライブラリのコンポーネント
- クライアント実行が前提のライブラリ

#### 3. RSC Payload転送量削減
- 大量データの中からクライアントで一部表示

### Container-Presentationalパターン

**Server ComponentsとClient Componentsの責務分離**

```tsx
// Container (Server Component) - データフェッチ
async function ProductContainer({ id }) {
  const product = await getProduct(id);
  return <ProductView product={product} />;
}

// Presentational (Client Component) - インタラクション
"use client";
function ProductView({ product }) {
  const [selected, setSelected] = useState(false);
  return <div onClick={() => setSelected(!selected)}>...</div>;
}
```

## 第3部: キャッシュ

### 4層キャッシュ構造

| キャッシュ層 | 対象 | 場所 | 目的 | 持続期間 |
|-------------|------|------|------|----------|
| Request Memoization | APIレスポンス | Server | Component tree内データ再利用 | リクエスト毎 |
| Data Cache | APIレスポンス | Server | ユーザー・デプロイ跨ぎ再利用 | 永続的 |
| Full Route Cache | HTML・RSC payload | Server | レンダリングコスト削減 | 永続的 |
| Router Cache | RSC Payload | Client | ナビゲーション効率化 | セッション内 |

### キャッシュコントロール

**注意**: Next.js v15でキャッシュデフォルト設定が変更
- 従来より控えめなキャッシュ
- Dynamic IO（実験機能）ではオプトイン設計検討中

## 第4部: レンダリング

### 新しいレンダリングモデル
**従来のSSR/SSG/ISRに加えて**:

#### Streaming対応
- **Streaming SSR**: 段階的なHTML送信
- **Partial Pre-Rendering (PPR)**: 静的・動的部分の最適統合

#### メリット
- 高パフォーマンス実現
- シンプルなメンタルモデル
- 従来より柔軟な最適化

## 第5部: その他プラクティス

### App Router特有の実装

#### 従来のWeb MVCとの違い
- リクエスト・レスポンスオブジェクト直接参照不可
- 認可レイヤーの異なるアプローチ
- 独自の実装パターン必要

#### よく利用されるプラクティス
- リクエスト情報の参照方法
- 認証・認可の実装パターン
- エラーハンドリング戦略

## 開発時の心構え

### パラダイムシフト
- **サーバーファースト思考**: クライアントではなくサーバーを活用
- **コロケーション重視**: 関連コードを近くに配置
- **段階的最適化**: まずServer Components、必要時にClient Components

### GraphQLとの関係
- RSCはGraphQLの精神的後継
- GraphQLの課題をRSCが解決
- RSC + GraphQLは推奨されない（複雑性増大）

## 実装の流れ

1. **Server Componentsでデータフェッチ**
2. **コロケーションでバケツリレー回避**
3. **必要に応じてClient Components追加**
4. **適切なキャッシュ戦略選択**
5. **パフォーマンス観点でレンダリング最適化**