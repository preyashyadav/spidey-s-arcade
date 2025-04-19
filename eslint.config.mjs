import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // extend Next.js defaults
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // your custom rule overrides:
  {
    rules: {
      // allow unused vars for now
      "@typescript-eslint/no-unused-vars": "off",
      // allow unescaped apostrophes in JSX
      "react/no-unescaped-entities": "off",
      // permit {} empty‐object types
      "@typescript-eslint/no-empty-object-type": "off",
      // let you keep <img> elements
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;
