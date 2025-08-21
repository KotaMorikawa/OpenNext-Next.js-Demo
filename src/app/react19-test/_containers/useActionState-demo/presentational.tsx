import {
  MessageForm,
  UserRegistrationForm,
} from "../../_components/React19Forms";

// Presentational Component: UIの表示のみを担当
export function UseActionStateDemoPresentation() {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        1. useActionState Hook デモ
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserRegistrationForm />
        <MessageForm />
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
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
            <div className="text-sm text-blue-700">
              <strong className="font-medium">特徴:</strong>
              これらのフォームはuseActionState()を使用しており、
              フォーム送信の状態管理、エラーハンドリング、バリデーション結果の表示が
              自動的に行われます。送信中は自動でボタンが無効化されます。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
