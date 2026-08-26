import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import jsdoc from 'eslint-plugin-jsdoc';
import jsxA11y from 'eslint-plugin-jsx-a11y';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Every exported function in the domain layer carries a doc comment,
  // so IDE hover and agent search explain it without opening the file.
  {
    plugins: { jsdoc },
    files: ['src/lib/**/*.ts', 'src/server/**/*.ts'],
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
  // cannot be merged unnoticed. Registered under `jsxA11y` (not `jsx-a11y`)
  // so the plugin does not collide with the copy eslint-config-next bundles
  // when the two configs merge for the same file.
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
    '.next/**',
    'node_modules/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    'dist/**',
  ]),
]);

export default eslintConfig;
