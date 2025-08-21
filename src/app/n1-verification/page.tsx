import type { Metadata } from "next";
import N1VerificationContainer from "./_containers/n1-verification-container";

export const metadata: Metadata = {
  title: "N+1問題検証 | OpenNext Demo",
  description:
    "DataLoaderを使用したN+1問題の解決方法とパフォーマンス比較のデモンストレーション",
};

export default function N1VerificationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            N+1問題検証とDataLoader実装
          </h1>
          <p className="text-gray-600 mt-2">
            Next.js 15 + DataLoader + Drizzle
            ORMによるN+1問題の解決方法とパフォーマンス比較
          </p>
        </header>

        <N1VerificationContainer />
      </div>
    </div>
  );
}
