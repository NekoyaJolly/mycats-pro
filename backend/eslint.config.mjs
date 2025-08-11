/**
 * ESLint設定ファイル (バックエンド)
 * NestJS + TypeScript + Prisma 用フラット設定
 * 
 * 設定方針:
 * - サーバーサイドの型安全性を重視
 * - NestJS/Prisma のベストプラクティスに準拠
 * - テストファイルは柔軟なルール適用
 * - 段階的な品質改善をサポート
 */

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importX from 'eslint-plugin-import-x';
import prettier from 'eslint-config-prettier';

export default [
  // === 基本設定 ===
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  
  // === メイン設定 ===
  {
    name: 'backend-main-config',
    files: ['src/**/*.ts', 'src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.eslint.json', // ESLint専用tsconfig使用
        tsconfigRootDir: import.meta.dirname
      },
      globals: {
        node: true,
        jest: true
      }
    },
    plugins: {
      'import-x': importX,
    },
    rules: {
      // === TypeScript Rules ===
      // サーバーサイドでは型安全性をより重視
      '@typescript-eslint/no-explicit-any': 'warn', // TODO: 段階的にerrorに
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      
      // TypeScript unsafe operations - 段階的改善
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/require-await': 'off', // NestJSでは非同期デコレータが多用される
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/prefer-promise-reject-errors': 'warn',
      
      // === Import/Export Rules ===
      'import-x/order': ['warn', {
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        'alphabetize': { 'order': 'asc', 'caseInsensitive': true }
      }],
      'import-x/no-duplicates': 'error',
      'import-x/no-unresolved': 'warn',
      
      // === NestJS/Node.js Specific ===
      'no-console': 'off', // サーバーサイドではログ出力が重要
      'no-process-env': 'off', // 環境変数の使用は必要
    },
    settings: {
      'import-x/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.eslint.json'
        },
        node: true
      }
    }
  },
  
  // === テストファイル専用設定 ===
  {
    name: 'backend-test-config',
    files: ['test/**/*.ts', 'src/**/*.spec.ts', 'src/**/*.test.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname
      },
      globals: {
        jest: true
      }
    },
    rules: {
      // テストファイルでは型制約を緩和
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      'no-console': 'off', // テスト時のデバッグ用
    }
  },
  
  // === スクリプトファイル専用設定 ===
  {
    name: 'backend-scripts-config',
    files: ['src/scripts/**/*.ts', 'src/scripts/**/*.mjs'],
    rules: {
      // スクリプトファイルでは制約を緩和
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      'no-console': 'off', // スクリプトでのログ出力は許可
    }
  },
  
  // === 除外設定 ===
  {
    name: 'backend-ignores',
    ignores: [
      'dist/**', 
      'node_modules/**', 
      'coverage/**',
      'prisma/migrations/**',
      '**/*.d.ts',
      '*.config.js',
      '*.config.mjs'
    ]
  }
];
