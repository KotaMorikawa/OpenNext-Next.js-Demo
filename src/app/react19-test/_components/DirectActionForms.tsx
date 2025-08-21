import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { items } from "@/lib/db/schema";
import {
  createItem,
  createPost,
  deleteItem,
} from "../_lib/actions/form-actions";

// React 19 form action属性デモ - Server Component
export function PostCreationForm() {
  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          投稿作成フォーム
        </h3>
        <div className="flex items-center space-x-2 text-sm">
          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
            form action属性
          </span>
          <span className="text-gray-500">React 19 新機能</span>
        </div>
      </div>

      {/* 直接action属性を使用したフォーム */}
      <form action={createPost} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            タイトル
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="投稿のタイトルを入力"
          />
        </div>

        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            内容
          </label>
          <textarea
            id="content"
            name="content"
            rows={4}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="投稿の内容を入力"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          投稿を作成（リダイレクト付き）
        </button>
      </form>

      {/* 技術情報 */}
      <div className="mt-4 border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-2 text-sm">
          form action属性の特徴:
        </h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• HTMLフォームのaction属性に直接Server Actionを指定</li>
          <li>• JavaScript無効時でも動作（Progressive Enhancement）</li>
          <li>• フォーム送信後の処理が自動化</li>
          <li>• リダイレクトやリフレッシュが簡単</li>
        </ul>
      </div>

      <div className="mt-4 bg-yellow-50 p-3 rounded text-xs">
        <div className="font-medium text-yellow-900 mb-1">動作説明:</div>
        <div className="text-yellow-700">
          このフォームを送信すると、createPost Server Actionが実行され、
          成功時は /posts/[random-id] ページにリダイレクトされます。
        </div>
      </div>
    </div>
  );
}

// アイテム作成フォーム
export function ItemCreationForm() {
  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          アイテム作成フォーム
        </h3>
        <div className="flex items-center space-x-2 text-sm">
          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
            form action属性
          </span>
          <span className="text-gray-500">データベース連携</span>
        </div>
      </div>

      <form action={createItem} className="space-y-4">
        <div>
          <label
            htmlFor="item-name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            アイテム名
          </label>
          <input
            type="text"
            id="item-name"
            name="name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="アイテム名を入力"
          />
        </div>

        <div>
          <label
            htmlFor="item-description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            説明（任意）
          </label>
          <textarea
            id="item-description"
            name="description"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="アイテムの説明を入力"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          アイテムを作成
        </button>
      </form>
    </div>
  );
}

// 削除アクション付きアイテムリスト
export async function ItemManagementList() {
  // データベースから最新のアイテムを取得
  const itemList = await db
    .select()
    .from(items)
    .orderBy(desc(items.createdAt))
    .limit(10);

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">アイテム管理</h3>
        <div className="flex items-center space-x-2 text-sm">
          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
            form action属性
          </span>
          <span className="text-gray-500">削除アクション</span>
        </div>
      </div>

      {itemList.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>アイテムがありません</p>
          <p className="text-sm">上記のフォームから作成してください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {itemList.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.name}</h4>
                {item.description && (
                  <p className="text-sm text-gray-600">{item.description}</p>
                )}
                <div className="text-xs text-gray-400 mt-1">
                  ID: {item.id}
                  {item.createdAt && (
                    <span className="ml-2">
                      作成:{" "}
                      {new Date(item.createdAt).toLocaleDateString("ja-JP")}
                    </span>
                  )}
                </div>
              </div>

              {/* 削除フォーム */}
              <form action={deleteItem.bind(null, item.id)} className="ml-4">
                <button
                  type="submit"
                  className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-1 px-3 rounded transition-colors"
                >
                  削除
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      {/* 技術情報 */}
      <div className="mt-4 border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-2 text-sm">
          実装のポイント:
        </h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Server Action.bind()でパラメータを事前バインド</li>
          <li>• 各アイテムに独立したフォームを配置</li>
          <li>• JavaScript無効でも削除操作が可能</li>
          <li>• Server Componentでの純粋なform action実装</li>
          <li>• PostgreSQLデータベースとの実際の連携</li>
        </ul>
      </div>

      <div className="mt-4 bg-blue-50 p-3 rounded text-xs">
        <div className="font-medium text-blue-900 mb-1">注意:</div>
        <div className="text-blue-700">
          これはデモ用の実装です。削除ボタンをクリックすると即座に
          サーバーログにメッセージが出力され、ページがリフレッシュされます。
        </div>
      </div>
    </div>
  );
}

// 複数アクション付きフォーム
export function MultiActionForm() {
  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          複数アクションフォーム
        </h3>
        <div className="flex items-center space-x-2 text-sm">
          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
            formAction属性
          </span>
          <span className="text-gray-500">ボタン別アクション</span>
        </div>
      </div>

      {/* デフォルトアクションと個別ボタンアクション */}
      <form action={createPost} className="space-y-4">
        <div>
          <label
            htmlFor="multi-title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            内容
          </label>
          <input
            type="text"
            id="multi-title"
            name="title"
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="テキストを入力"
          />
          <input
            type="hidden"
            name="content"
            value="複数アクションフォームからの投稿"
          />
        </div>

        <div className="flex space-x-3">
          {/* デフォルトアクション使用 */}
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            投稿として作成
          </button>

          {/* 異なるアクションを使用 */}
          <button
            type="submit"
            formAction={deleteItem.bind(null, "demo-item")}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            テスト削除実行
          </button>
        </div>
      </form>

      {/* 技術情報 */}
      <div className="mt-4 border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-2 text-sm">
          複数アクションの仕組み:
        </h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• form要素のaction属性がデフォルトアクション</li>
          <li>• button要素のformAction属性で個別アクションを指定可能</li>
          <li>• 同一フォームで複数の処理パターンを実現</li>
          <li>• React 19でServer Actionsとの連携が強化</li>
        </ul>
      </div>
    </div>
  );
}
