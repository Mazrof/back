import globals from 'globals';
import tseslint from '@typescript-eslint/eslint-plugin'; // Typescript plugin
import tsParser from '@typescript-eslint/parser'; // Parser for TypeScript
import prettierConfig from 'eslint-config-prettier'; // Prettier conflict management
export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      globals: globals.browser,
      ecmaVersion: 'latest', // Use the latest ECMAScript features
      sourceType: 'module', // Enable ES6 modules
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettierConfig, // Integrate Prettier
    },
    rules: {
      // TypeScript Recommended Rules
      ...tseslint.configs.recommended.rules,

      // Prettier Conflict Rules (Disable conflicting rules)
      ...prettierConfig.rules,

      // Custom Rules
      'no-unused-vars': 'disable', // Warn about unused variables
      'consistent-return': 'error', // Enforce consistent return types
      eqeqeq: ['error', 'always'], // Require strict equality checks
      'no-console': 'warn', // Warn about console.log
      'handle-callback-err': 'error', // Ensure error handling in callbacks
    },
  },
];
