/** @type {import('prettier').Config} */
module.exports = {
  // Core formatting options
  semi: true,
  trailingComma: "all",
  singleQuote: false,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  
  // JSX specific options
  jsxSingleQuote: false,
  jsxBracketSameLine: false,
  
  // Object formatting
  bracketSpacing: true,
  bracketSameLine: false,
  
  // Arrow function parentheses
  arrowParens: "always",
  
  // Range formatting
  rangeStart: 0,
  rangeEnd: Infinity,
  
  // File handling
  requirePragma: false,
  insertPragma: false,
  
  // Prose wrapping
  proseWrap: "preserve",
  
  // HTML whitespace sensitivity
  htmlWhitespaceSensitivity: "css",
  
  // Vue file script and style tags indentation
  vueIndentScriptAndStyle: false,
  
  // Line endings
  endOfLine: "lf",
  
  // Embedded language formatting
  embeddedLanguageFormatting: "auto",
  
  // Single attribute per line in HTML, Vue and JSX
  singleAttributePerLine: false,
  
  // Plugin-specific configuration
  plugins: [
    "prettier-plugin-tailwindcss",
    "@trivago/prettier-plugin-sort-imports",
  ],
  
  // Tailwind CSS plugin options
  tailwindConfig: "./tailwind.config.ts",
  tailwindFunctions: ["cn", "cva"],
  
  // Import sorting plugin options
  importOrder: [
    "^(react/(.*)$)|^(react$)",
    "^(next/(.*)$)|^(next$)",
    "<THIRD_PARTY_MODULES>",
    "^@xala-technologies/(.*)$",
    "^@/config/(.*)$",
    "^@/lib/(.*)$",
    "^@/hooks/(.*)$",
    "^@/services/(.*)$",
    "^@/utils/(.*)$",
    "^@/types/(.*)$",
    "^@/components/ui/(.*)$",
    "^@/components/(.*)$",
    "^@/(.*)$",
    "^[./]",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderBuiltinModulesToTop: true,
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  importOrderMergeDuplicateImports: true,
  importOrderCombineTypeAndValueImports: true,
  
  // File-specific overrides
  overrides: [
    {
      files: "*.json",
      options: {
        printWidth: 80,
        tabWidth: 2,
      },
    },
    {
      files: "*.md",
      options: {
        printWidth: 80,
        proseWrap: "always",
        tabWidth: 2,
        useTabs: false,
      },
    },
    {
      files: "*.yml",
      options: {
        tabWidth: 2,
        useTabs: false,
      },
    },
    {
      files: "*.yaml",
      options: {
        tabWidth: 2,
        useTabs: false,
      },
    },
    {
      files: "*.css",
      options: {
        tabWidth: 2,
        useTabs: false,
      },
    },
    {
      files: "*.scss",
      options: {
        tabWidth: 2,
        useTabs: false,
      },
    },
    {
      files: "*.less",
      options: {
        tabWidth: 2,
        useTabs: false,
      },
    },
    {
      files: "*.vue",
      options: {
        tabWidth: 2,
        useTabs: false,
      },
    },
    {
      files: "*.html",
      options: {
        tabWidth: 2,
        useTabs: false,
        htmlWhitespaceSensitivity: "ignore",
      },
    },
  ],
};