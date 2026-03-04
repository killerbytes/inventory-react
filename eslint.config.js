import reactYouMightNotNeedAnEffect from "eslint-plugin-react-you-might-not-need-an-effect";
import reactRefresh from "eslint-plugin-react-refresh";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import globals from "globals";
import js from "@eslint/js";

export default tseslint.config(
  { ignores: ["dist"] },
  reactYouMightNotNeedAnEffect.configs.recommended,
  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
);
