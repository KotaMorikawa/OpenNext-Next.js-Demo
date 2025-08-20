# コーディングスタイル・規約

## フォーマット設定 (Biome)

### インデント・スタイル
- **インデントスタイル**: スペース
- **インデント幅**: 2スペース
- **自動インポート整理**: 有効

### ファイル管理
- 除外パターン: `node_modules`, `.next`, `dist`, `build`
- 未知のファイル形式を無視: 有効

## リント規則
- **推奨ルール**: 有効
- **Next.js推奨ルール**: 有効  
- **React推奨ルール**: 有効

## TypeScript設定

### コンパイラオプション
- **Target**: ES2017
- **Strict Mode**: 有効
- **JSX**: preserve
- **Module Resolution**: bundler

### パスエイリアス
- `@/*` → `./src/*`

## ファイル命名規約
- React コンポーネント: PascalCase (例: `layout.tsx`, `page.tsx`)
- 設定ファイル: lowercase with dots (例: `next.config.ts`)
- CSSファイル: lowercase (例: `globals.css`)

## コンポーネント設計パターン
- App Router構造を使用
- レイアウト・ページの分離
- TypeScript型注釈の必須使用
- Metadata エクスポートの活用

## Git設定
- VCS統合: 有効
- .gitignoreファイル使用: 有効

## 注意事項
- node_modules等は自動除外
- 型安全性を重視
- Biomeによる自動フォーマットに依存