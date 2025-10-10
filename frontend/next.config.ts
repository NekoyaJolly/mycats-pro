import type { NextConfig } from "next";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// Bundle Analyzer (ANALYZE=true でビルド時に有効化)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: [],
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
  output: 'standalone',
  // Bundle size optimization
  // swcMinify: true, // Removed in Next.js 15 as it's default
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
