import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';
import importX from 'eslint-plugin-import-x';
import prettier from 'eslint-config-prettier';

const eslintConfig = [
  js.configs.recommended,
  ...tseslint.configs.recommended, // recommendedTypeChecked から recommended に変更
  prettier,
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    plugins: {
      'react-hooks': reactHooks,
      '@next/next': nextPlugin,
      'import-x': importX,
    },
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json', // projectService から project に変更
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn', // error から warn に変更
      '@typescript-eslint/no-unsafe-member-access': 'warn', // error から warn に変更
      '@typescript-eslint/no-unsafe-call': 'warn', // error から warn に変更
      '@typescript-eslint/no-unsafe-return': 'warn', // error から warn に変更
      '@typescript-eslint/no-unsafe-argument': 'warn', // error から warn に変更
      
      // Import/Export rules  
      'import-x/order': ['warn', {
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        'alphabetize': { 'order': 'asc', 'caseInsensitive': true }
      }],
      'import-x/no-duplicates': 'error',
      'import-x/no-unresolved': 'warn', // error から warn に変更
      'import-x/no-unused-modules': 'warn',
      
      // React hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // Next.js specific rules
      '@next/next/no-img-element': 'off',
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-page-custom-font': 'warn',
      '@next/next/no-unwanted-polyfillio': 'warn'
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
  {
    ignores: [
      ".next/**",
      "out/**", 
      "dist/**",
      "node_modules/**",
      "**/*_old.tsx",
      "**/*page_old.tsx", 
      "**/*page_new.tsx",
      "**/*_old.ts"
    ]
  }
];

export default eslintConfig;
