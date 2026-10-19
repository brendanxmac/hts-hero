import js from "@eslint/js";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import globals from "globals";

const config = [
  {
    ignores: [".claude/**", ".next/**", "out/**", "build/**", "node_modules/**", "next-env.d.ts", "public/**"],
  },
  js.configs.recommended,
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "react-hooks/exhaustive-deps": "off",
      // The React Compiler rules that arrived with eslint-config-next 16: warnings until the code
      // they flag is reworked
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/use-memo": "warn",
    },
  },
  {
    // CommonJS config files and tests that load JSON or CommonJS modules
    files: ["**/*.js", "**/*.cjs", "testing/**"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];

export default config;
