module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true
  },
  extends: [
    'airbnb-base'
  ],
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {
    'no-console': 'off',
    'comma-dangle': ['error', 'never'],
    'no-await-in-loop': 'off',
    'no-restricted-syntax': 'off',
    'no-prototype-builtins': 'off',
    'no-underscore-dangle': 'off',
    'no-restricted-globals': 'off',
    'import/no-extraneous-dependencies': 'off',
    'max-len': ['error', { code: 120 }]
  }
};
