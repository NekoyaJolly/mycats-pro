/**
 * ESLint設定ファイル (フロントエンド)
 * Next.js + React + TypeScript 用フラット設定
 * 
 * 設定方針:
 * - 開発効率を重視し、警告レベルでの運用
 * - TypeScript型安全性は段階的改善
 * - Next.js/React のベストプラクティスに準拠
 * - Import順序は簡素化してメンテナンス性重視
 */

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';
import importX from 'eslint-plugin-import-x';
import prettier from 'eslint-config-prettier';
import { FlatCompat } from "@eslint/eslintrc";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const eslintConfig = [
  // Next.js configs from the codemod
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  
  // === 基本設定 ===
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  
  // === TypeScript設定 ===
  {
    name: 'frontend-typescript-config',
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      'react-hooks': reactHooks,
      '@next/next': nextPlugin,
      'import-x': importX,
    },
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname
      }
    },
    rules: {
      // === TypeScript Rules ===
      // 開発段階では警告レベルで運用、段階的にerrorに移行
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'warn', // TODO: 長期的にerrorに
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/triple-slash-reference': 'off', // Next.js generated files
      
      // === Import/Export Rules ===
      // 警告削減のため順序チェックは一旦無効化（将来Re-enable検討）
      'import-x/order': 'off',
      'import-x/no-duplicates': 'error',
      'import-x/no-unresolved': 'off', // TypeScriptで解決するため無効化
      'import-x/no-unused-modules': 'off', // 開発段階では無効化
      
      // === React/Next.js Rules ===
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@next/next/no-img-element': 'off', // Next.js Image component推奨だが強制しない
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-page-custom-font': 'warn',
      '@next/next/no-unwanted-polyfillio': 'warn',
      
      // === 一般的なJavaScript Rules ===
      // 開発効率優先でconsoleは許可（本番ビルド時に見直し）
      'no-console': 'off',
      'no-debugger': 'warn',
    },
    settings: {
      next: {
        rootDir: '.'
      },
      'import-x/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json'
        },
        node: true
      }
    }
  },

  // === JavaScript設定 (TypeScriptプロジェクトチェックなし) ===
  {
    name: 'frontend-javascript-config',
    files: ["**/*.js", "**/*.jsx"],
    plugins: {
      'react-hooks': reactHooks,
      '@next/next': nextPlugin,
      'import-x': importX,
    },
    rules: {
      // === React/Next.js Rules ===
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@next/next/no-img-element': 'off',
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-page-custom-font': 'warn',
      '@next/next/no-unwanted-polyfillio': 'warn',
      
      // === 一般的なJavaScript Rules ===
      'no-console': 'off',
      'no-debugger': 'warn',
    },
    settings: {
      next: {
        rootDir: '.'
      }
    }
  },
  
  // === テストファイル専用設定 ===
  {
    name: 'frontend-test-config',
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      // テストファイルではany型使用を許可
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      'no-console': 'off', // テスト時のデバッグ用
    }
  },

  // === UIファイルの段階的緩和（app/components）===
  {
    name: 'frontend-ui-relax-rules',
    files: ['src/app/**/*.tsx', 'src/components/**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    }
  },
  
  // === 除外設定 ===
  {
    name: 'frontend-ignores',
    ignores: [
      ".next/**",
      "out/**", 
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "next-env.d.ts",
      "**/*_old.tsx",
      "**/*page_old.tsx", 
      "**/*page_new.tsx",
      "**/*_old.ts",
      "*.config.js",
      "*.config.mjs"
    ]
  }
];

export default eslintConfig;
