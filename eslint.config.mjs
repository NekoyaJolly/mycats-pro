/**
 * プロジェクトルート ESLint設定ファイル
 * 猫生体管理システム (My Cats) 全体設定
 * 
 * このファイルの役割:
 * - プロジェクト全体の基本ESLintポリシーを定義
 * - ルートレベルの設定ファイル・スクリプトファイルの品質管理
 * - サブディレクトリ（frontend/backend）は個別設定を使用
 * 
 * 設定方針:
 * - 各サブプロジェクトは独自の設定ファイルを持つ
 * - ルートレベルでは最小限の設定で混乱を避ける
 * - 共通のコード品質基準を維持
 */

import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  // === 基本設定 ===
  js.configs.recommended,
  ...tseslint.configs.recommended,
  
  // === ルートレベル設定 ===
  {
    name: 'root-project-config',
    files: ['*.js', '*.mjs', '*.ts', '*.json'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        node: true
      }
    },
    rules: {
      // 基本的なJavaScript/TypeScriptルール
      'no-console': 'off', // ルートスクリプトでの出力は許可
      'no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      
      // 設定ファイルでは柔軟性を優先
      '@typescript-eslint/no-require-imports': 'off',
    }
  },
  
  // === 除外設定 ===
  {
    name: 'root-ignores',
    ignores: [
      // サブプロジェクトディレクトリ（個別設定を使用）
      'frontend/**',
      'backend/**',
      
      // 生成ファイル・依存関係
      'node_modules/**',
      'dist/**',
      'coverage/**',
      '*.log',
      
      // 環境固有ファイル
      '.env*',
      '.DS_Store',
      
      // ドキュメント・設定ファイル
      'docs/**',
      'README.md',
      '*.md',
      '.git/**',
      '.github/**',
      
      // データベース関連
      'database/**',
      '*.sql',
      '*.db',
      '*.sqlite',
      
      // その他のプロジェクト固有ファイル
      'nginx/**',
      'scripts/**',
      '*.ini',
      '*.csv'
    ]
  }
];
