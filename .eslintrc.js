module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
  plugins: ['react', 'react-hooks', 'jest', 'import', '@typescript-eslint'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    curly: ['error', 'multi-line'],
    'jsx-quotes': 'error',
    'no-trailing-spaces': 'error',
    'no-undef': 'error',
    'no-unused-expressions': 'error',
    'react-hooks/rules-of-hooks': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        args: 'after-used',
        ignoreRestSiblings: true,
        vars: 'all',
      },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/__tests__/**/*.js',
          '**/*test.js',
          '**/tests/**/*.js',
          '**/examples/**/*.js',
          '**/build/**/*.js',
          'packages/fields/src/**/filterTests.js',
          '**/test-fixtures.ts',
        ],
      },
    ],
    'import/no-unresolved': 'error',
    'jest/valid-describe': 'off',
    'jest/valid-expect': 'off',
    'jest/no-conditional-expect': 'off',
    'jest/no-standalone-expect': 'off',
    'jest/expect-expect': 'off',
    'jest/no-export': 'off',
    'jest/valid-title': 'off',
    'jest/no-try-expect': 'off',
    'object-curly-spacing': ['error', 'always'],
    quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
    'react/jsx-boolean-value': 'warn',
    'react/jsx-no-undef': 'error',
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'react/jsx-wrap-multilines': 'warn',
    'react/no-did-mount-set-state': 'warn',
    'react/no-did-update-set-state': 'warn',
    'react/no-unknown-property': 'warn',
    'react/react-in-jsx-scope': 'error',
    'react/self-closing-comp': 'warn',
    'react/sort-prop-types': 'warn',
    semi: 'error',
    strict: 'off',
  },
  extends: ['plugin:jest/recommended'],

  // Disable some rules for (code blocks within) Markdown docs
  overrides: [
    {
      files: ['**/*.md'],
      rules: {
        'no-unused-vars': 'off',
        'no-undef': 'off',
      },
    },
    {
      files: ['packages/fields/src/**/*.js'],
      rules: {
        'import/no-commonjs': 'error',
      },
    },
    {
      files: ['packages/build-field-types/__fixtures__/**/*.js'],
      rules: {
        'import/no-unresolved': 'off',
      },
    },
    {
      files: ['**/*.{ts,tsx}'],
      rules: {
        // TypeScript already checks for the following things and they conflict with TypeScript
        'import/no-unresolved': 'off',
        'no-undef': 'off',
      },
    },
  ],
};
