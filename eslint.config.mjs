import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [".logs/**", ".next/**", "node_modules/**", "dist/**", "out/**"],
  },
  ...nextVitals,
  ...nextTypescript,
];

export default eslintConfig;
