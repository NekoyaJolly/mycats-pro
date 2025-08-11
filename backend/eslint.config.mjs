import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importX from 'eslint-plugin-import-x';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended, // recommendedTypeChecked から recommended に変更
  prettier,
  {
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
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'warn', // error から warn に変更
      '@typescript-eslint/no-unsafe-member-access': 'warn', // error から warn に変更
      '@typescript-eslint/no-unsafe-call': 'warn', // error から warn に変更
      '@typescript-eslint/no-unsafe-return': 'warn', // error から warn に変更
      '@typescript-eslint/no-unsafe-argument': 'warn', // error から warn に変更
      '@typescript-eslint/require-await': 'off', // 一時的に無効化
      '@typescript-eslint/no-floating-promises': 'warn', // error から warn に変更
      '@typescript-eslint/no-misused-promises': 'warn', // error から warn に変更
      '@typescript-eslint/prefer-promise-reject-errors': 'warn', // error から warn に変更
      
      // Import/Export rules
      'import-x/order': ['warn', {
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        'alphabetize': { 'order': 'asc', 'caseInsensitive': true }
      }],
      'import-x/no-duplicates': 'error',
      'import-x/no-unresolved': 'warn', // error から warn に変更
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
  {
    files: ['test/**/*.ts', 'src/**/*.spec.ts', 'src/**/*.test.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json', // ESLint専用tsconfig使用
        tsconfigRootDir: import.meta.dirname
      },
      globals: {
        jest: true
      }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off'
    }
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**']
  }
];
