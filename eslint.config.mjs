import { defineConfig, globalIgnores } from 'eslint/config';
import next from '@next/eslint-plugin-next';
import jsdoc from 'eslint-plugin-jsdoc';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tseslint from 'typescript-eslint';

export default defineConfig([
  ...tseslint.configs.recommended,

  {
    files: ['apps/web/src/**/*.{ts,tsx}'],
    plugins: { '@next/next': next },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs['core-web-vitals'].rules,
      // This repo uses the App Router only, so the Pages Router rule has no
      // directory to inspect.
      '@next/next/no-html-link-for-pages': 'off',
    },
  },

  // Every exported function in the domain layer carries a doc comment,
  // so IDE hover and agent search explain it without opening the file.
  {
    plugins: { jsdoc },
    files: ['apps/web/src/lib/**/*.ts', 'apps/web/src/server/**/*.ts'],
    ignores: ['**/*.test.ts'],
    rules: {
      'jsdoc/require-jsdoc': [
        'error',
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: true,
            FunctionExpression: true,
          },
        },
      ],
    },
  },

  // Accessibility rules enforced explicitly so a broken interaction pattern
  // cannot be merged unnoticed.
  {
    plugins: { jsxA11y },
    rules: {
      'jsxA11y/interactive-supports-focus': 'error',
      'jsxA11y/click-events-have-key-events': 'error',
      'jsxA11y/label-has-associated-control': [
        'error',
        { controlComponents: ['Input'], assert: 'either', depth: 3 },
      ],
      'jsxA11y/alt-text': 'error',
      'jsxA11y/tabindex-no-positive': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },

  globalIgnores([
    '**/.next/**',
    '**/node_modules/**',
    '**/coverage/**',
    '**/playwright-report/**',
    '**/test-results/**',
    '**/dist/**',
    '**/out/**',
  ]),
]);
