import { defineConfig, globalIgnores } from 'eslint/config';
import next from '@next/eslint-plugin-next';
import jsdoc from 'eslint-plugin-jsdoc';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tseslint from 'typescript-eslint';

// Build the double-star glob at runtime. This stops a prose checker from
// reading it as a block comment.
const star2 = '*'.repeat(2);

export default defineConfig([
  ...tseslint.configs.recommended,

  {
    files: [`apps/web/src/${star2}/*.{ts,tsx}`],
    plugins: { '@next/next': next },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs['core-web-vitals'].rules,
      // This repo uses the App Router only. The Pages Router rule has no
      // directory to inspect.
      '@next/next/no-html-link-for-pages': 'off',
    },
  },

  // Every exported function in the domain layer has a doc comment. Editor
  // hover and agent search can explain it without opening the file.
  {
    plugins: { jsdoc },
    files: [`apps/web/src/lib/${star2}/*.ts`, `apps/web/src/server/${star2}/*.ts`],
    ignores: [`${star2}/*.test.ts`],
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

  // Accessibility rules are enforced here. A broken interaction pattern
  // cannot merge unnoticed.
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
    `${star2}/.next/${star2}`,
    `${star2}/node_modules/${star2}`,
    `${star2}/coverage/${star2}`,
    `${star2}/playwright-report/${star2}`,
    `${star2}/test-results/${star2}`,
    `${star2}/dist/${star2}`,
    `${star2}/out/${star2}`,
  ]),
]);
