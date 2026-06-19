import eslint from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.es2022,
    },
    rules: {
      eqeqeq: ["error", "always"],
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-implicit-coercion": "error",
      "no-restricted-globals": [
        "error",
        {
          name: "EventSource",
          message:
            "Network access requires an explicit LocalFiles privacy review.",
        },
        {
          name: "WebSocket",
          message:
            "Network access requires an explicit LocalFiles privacy review.",
        },
        {
          name: "XMLHttpRequest",
          message:
            "Network access requires an explicit LocalFiles privacy review.",
        },
        {
          name: "fetch",
          message:
            "Network access requires an explicit LocalFiles privacy review.",
        },
      ],
    },
  },
  {
    files: ["apps/web/src/**/*.{ts,tsx}", "packages/ui/src/**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      "react-hooks/exhaustive-deps": "error",
      "react-hooks/rules-of-hooks": "error",
    },
  },
);
