import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: [],
  // GitHub Pages static export configuration
  output: "export", // 静的エクスポートを有効化
  trailingSlash: true, // GitHub Pages用の推奨設定
  basePath: "/mycats", // GitHub Pages用のベースパス設定
  images: {
    unoptimized: true, // 画像最適化を無効化
  },
  eslint: {
    // 本番ビルド時にESLintエラーを無視
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 本番ビルド時にTypeScriptエラーを無視（開発時は型チェックが有効）
    ignoreBuildErrors: false,
  },
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Build configuration
  generateEtags: false,
  poweredByHeader: false,
  // Remove rewrites and headers as they don't work with static export
};

export default nextConfig;
