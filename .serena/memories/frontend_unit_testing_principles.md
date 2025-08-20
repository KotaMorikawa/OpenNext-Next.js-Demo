# フロントエンド単体テストの原則と実践

## 単体テストの基本概念

### 単体テストの目的
- **退行 (regression) の検出**: ソフトウェア開発のセーフティネット
- **持続可能な開発**: 長期的な品質維持
- 設計の改善は副産物であり、主目標ではない

### 良い単体テストの4つの指標
1. **退行に対する保護**: バグの早期発見
2. **リファクタリングへの耐性**: 実装変更に対する安定性
3. **迅速なフィードバック**: 開発効率の向上
4. **保守のしやすさ**: テストコード自体の品質

## テスト設計アプローチ

### 古典学派 vs ロンドン学派
| 学派 | 単体の捉え方 | 推奨度 |
|------|-------------|--------|
| **古典学派** | テストケースを単体とし、共有依存のみテストダブル化 | ⭐推奨 |
| ロンドン学派 | 1クラス/コンポーネントを単体とし、他をすべてモック | △ |

**古典学派の利点**:
- より多くのコードを検証（退行検知力向上）
- テストダブルが少ない（保守性向上）
- mswなどの実践的なツールと相性が良い

## フロントエンド実装パターン

### Storybook + Jest連携
**責務分離**:
- **Storybook**: コンポーネントの代表的利用シナリオと見た目検証
- **Jest**: 重要な振る舞いとa11y構造の検証

**CSF3.0 + composeStories**活用:
```tsx
import { composeStories } from "@storybook/testing-react";
import * as stories from "./Component.stories";

const { ApiSuccess, ApiError } = composeStories(stories);
```

### AAAパターン実践
**テスト構造**:
```tsx
test("テストケース名", async () => {
  // Arrange（準備）
  const apiRequestCall = jest.fn();
  server.use(/* モックセットアップ */);
  
  // Act（実行）
  renderWithNoCache(<Component />);
  
  // Assert（確認）
  expect(await screen.findByText(/expected/)).toBeInTheDocument();
  expect(apiRequestCall).toHaveBeenCalledTimes(1);
});
```

## 実装ガイドライン

### テストケース命名
- 実装詳細ではなく、**ビジネス要件**を表現
- エンジニア以外も理解可能な命名
- describeでコンテキスト別にグルーピング

### 共通化戦略
**Arrange/Act の共通化**: ✅ 推奨
```tsx
const setupTodoApi = (callback) => {
  const apiRequestCall = jest.fn(callback);
  server.use(rest.get("/api/todos", apiRequestCall));
  return { apiRequestCall };
};
```

**Assert の共通化**: ❌ 非推奨
- 何を検証しているか不明になりやすい
- Custom Matcherの検討推奨

### MSW活用パターン
```tsx
// 成功パターン
export const ApiSuccess = {};

// エラーパターン  
export const ApiError = {
  parameters: {
    msw: [
      rest.get("/api/todos", (req, res, ctx) =>
        res(ctx.status(500), ctx.json({ message: "test error" }))
      ),
    ],
  },
};
```

## 技術スタック推奨
- **テストフレームワーク**: Jest / Vitest
- **React テスティング**: React Testing Library
- **ストーリー管理**: Storybook (CSF3.0)
- **API モック**: MSW (Mock Service Worker)
- **ユーザーイベント**: @testing-library/user-event

## 重要な注意点
- テストはプロダクションコード同様に**負債**となり得る
- 価値とコストのバランスを常に意識
- 実装詳細ではなく**ユーザー体験**を検証する