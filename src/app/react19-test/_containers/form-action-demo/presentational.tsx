import {
  ItemCreationForm,
  ItemManagementList,
  MultiActionForm,
  PostCreationForm,
} from "../../_components/DirectActionForms";

// Presentational Component: UIの表示のみを担当
export function FormActionDemoPresentation() {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        2. form action属性 デモ
      </h2>

      <div className="space-y-8">
        {/* 投稿作成フォーム */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PostCreationForm />
          <MultiActionForm />
        </div>

        {/* アイテム管理 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ItemCreationForm />
          <ItemManagementList />
        </div>
      </div>

      <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-orange-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <div className="text-sm text-orange-700">
              <strong className="font-medium">特徴:</strong>
              これらのフォームはaction属性に直接Server Actionを指定しており、
              JavaScriptが無効でも動作します。送信後は自動でページの更新や
              リダイレクトが行われます。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
