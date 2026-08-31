import globals from 'globals';

export default [
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**', 'coverage/**', '**/generated/**'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      // Definition of Done: no console.log in merged code.
      // console.warn and console.error are allowed.
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
    },
  },
  {
    // CLI scripts are meant to print to the terminal.
    files: ['prisma/**/*.js', 'scripts/**/*.js'],
    rules: { 'no-console': 'off' },
  },
  {
    files: ['**/tests/**/*.js', '**/*.test.js'],
    languageOptions: { globals: { ...globals.node } },
    rules: { 'no-console': 'off' },
  },
];
