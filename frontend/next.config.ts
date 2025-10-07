import type { NextConfig } from "next";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// Bundle Analyzer (ANALYZE=true でビルド時に有効化)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// GitHub Pages用の静的エクスポート設定を環境変数で制御
const isStaticExport = process.env.EXPORT_STATIC === 'true';
// GitHub Pages でのサブディレクトリ デプロイ用の base path 設定
const basePath = isStaticExport ? '/mycats' : '';

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: [],
  // GitHub Pages base path 設定（サブディレクトリ デプロイ用）
  ...(basePath && { basePath }),
  // GitHub Pages static export configuration (環境変数で制御)
  ...(isStaticExport && {
    output: "export", // 静的エクスポートを有効化
    trailingSlash: true, // GitHub Pages用の推奨設定
    assetPrefix: basePath, // アセット用のプレフィックス設定
  }),
  images: {
    unoptimized: isStaticExport, // GitHub Pages用の場合のみ画像最適化を無効化
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
  // Standalone output for production deployment
  output: isStaticExport ? 'export' : 'standalone',
  // Bundle size optimization
  swcMinify: true,
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: [
      '@mantine/core',
      '@mantine/hooks',
      '@mantine/notifications',
      '@tabler/icons-react',
    ],
  },
  // モノレポ対応のためのワークスペースルート設定
  outputFileTracingRoot: path.join(__dirname, "../"),
  // Remove rewrites and headers as they don't work with static export
};

export default withBundleAnalyzer(nextConfig);
