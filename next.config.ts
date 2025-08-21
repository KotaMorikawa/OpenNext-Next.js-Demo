import type { NextConfig } from "next";

/**
 * Next.js 15 設定ファイル
 * TypeScript strict mode対応の型安全な設定
 */
const nextConfig: NextConfig = {
  // TypeScript設定
  typescript: {
    // 型チェックを厳密に実行
    ignoreBuildErrors: false,
  },

  // ESLint設定
  eslint: {
    // ビルド時のESLintチェックを有効化
    ignoreDuringBuilds: false,
    // ESLint設定ディレクトリ
    dirs: ["src"],
  },

  // Turbopack設定（experimental.turboから移行）
  turbopack: {
    // カスタムローダールール（必要に応じて）
    rules: {},
    // モジュールエイリアス
    resolveAlias: {},
    // ファイル拡張子の解決
    resolveExtensions: [".mdx", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
  },

  // 画像最適化設定
  images: {
    // 外部画像ドメインの許可
    domains: [],
    // 画像フォーマットの優先順位
    formats: ["image/webp", "image/avif"],
    // レスポンシブ画像のサイズ
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },

  // パフォーマンス最適化
  poweredByHeader: false,
  reactStrictMode: true,

  // 開発環境設定
  ...(process.env.NODE_ENV === "development" && {
    // 開発環境でのみ有効な設定
    devIndicators: {
      position: "bottom-right",
    },
  }),

  // 本番環境設定
  ...(process.env.NODE_ENV === "production" && {
    // 本番環境でのみ有効な設定
    compress: true,
    generateEtags: true,
  }),

  // 型安全なヘッダー設定
  async headers(): Promise<
    Array<{
      source: string;
      headers: Array<{
        key: string;
        value: string;
      }>;
    }>
  > {
    return [
      {
        source: "/(.*)",
        headers: [
          // セキュリティヘッダー
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // CORS設定（開発環境用）
          ...(process.env.NODE_ENV === "development"
            ? [
                {
                  key: "Access-Control-Allow-Origin",
                  value: "*",
                },
              ]
            : []),
        ],
      },
    ];
  },

  // 型安全なリダイレクト設定
  async redirects(): Promise<
    Array<{
      source: string;
      destination: string;
      permanent: boolean;
    }>
  > {
    return [
      // 旧パスから新パスへのリダイレクト例
      {
        source: "/test",
        destination: "/react19-test",
        permanent: false,
      },
    ];
  },
} satisfies NextConfig; // satisfiesで型チェックを強化

export default nextConfig;
