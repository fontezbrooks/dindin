module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    es6: true,
    node: true,
  },
  rules: {
    // Prevent console.log in production code
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    
    // Other helpful rules
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    
    // Security rules
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
  },
  overrides: [
    {
      // Allow console in test files
      files: ['*.test.ts', '*.test.tsx', '*.test.js', '*.test.jsx', '*.spec.ts', '*.spec.tsx'],
      rules: {
        'no-console': 'off',
      },
    },
    {
      // Allow console in scripts
      files: ['scripts/**/*.js', 'scripts/**/*.ts'],
      rules: {
        'no-console': 'off',
      },
    },
    {
      // Logger files can use console
      files: ['**/logger.ts', '**/logger.js'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};