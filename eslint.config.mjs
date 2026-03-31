// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
// @ts-ignore
import perfectionist from "eslint-plugin-perfectionist";
// import vitest from "@vitest/eslint-plugin";

export default tseslint.config(
  {
    ignores: [
      "dist/**/*.js",
      "**/*.mjs",
      "eslint.config.mjs",
      "**/*.js",
      // "**/*.tes.ts",
    ],
  },
  {
    plugins: {
      perfectionist,
    },
    rules: {
      "perfectionist/sort-objects": [
        "error",
        {
          type: "alphabetical",
        },
      ],
      "perfectionist/sort-interfaces": ["error"],
    },
    settings: {
      perfectionist: {
        type: "line-length",
        partitionByComment: true,
      },
    },
  },
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        // projectService: true,
        projectService: {
          allowDefaultProject: [
            "eslint.config.mjs",
            "__tests__/*.ts",
            "__tests__/api/auth/*.ts",
            "__tests__/api/facilities/*.ts",
            "__tests__/api/reservations/*.ts",
            "__tests__/db/*.ts",
            "__tests__/integration/*.ts",
            "__tests__/utils/*.ts",
          ],
          defaultProject: "tsconfig.json",
        },
        tsconfigRootDir: import.meta.dirname,
        sourceType: "module",
      },
    },
  },
  // perfectionist.configs["recommended-natural"],
  // {
  //   files: ["**/*.test.ts", "**/*.spec.ts"],
  //   plugins: {
  //     vitest,
  //   },
  //   rules: {
  //     ...vitest.configs.recommended.rules,
  //     "@typescript-eslint/unbound-method": "off",
  //   },
  // },
);
