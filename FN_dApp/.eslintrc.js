module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2024,
    sourceType: "module",
    project: "./tsconfig.json"
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  rules: {
    "no-console": "warn",
    // add/adjust rules here as needed
  },
  ignorePatterns: [".next/", "node_modules/"]
};
