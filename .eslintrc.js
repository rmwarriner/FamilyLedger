module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  env: {
    es2023: true,
    node: true,
    browser: true
  },
  ignorePatterns: ['dist', 'build', 'node_modules'],
  rules: {
    'no-console': 'off'
  }
};
