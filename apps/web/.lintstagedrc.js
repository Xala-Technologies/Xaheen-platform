/** @type {import('lint-staged').Config} */
module.exports = {
  // TypeScript and JavaScript files
  "**/*.{ts,tsx,js,jsx}": [
    "eslint --fix",
    "prettier --write",
    "git add"
  ],
  
  // JSON files
  "**/*.json": [
    "prettier --write",
    "git add"
  ],
  
  // Markdown files
  "**/*.md": [
    "prettier --write",
    "git add"
  ],
  
  // CSS and styling files
  "**/*.{css,scss,less}": [
    "prettier --write",
    "git add"
  ],
  
  // YAML files
  "**/*.{yml,yaml}": [
    "prettier --write",
    "git add"
  ],
  
  // Package.json files
  "**/package.json": [
    "prettier --write",
    "git add"
  ],
  
  // Configuration files
  "**/*.config.{js,mjs,ts}": [
    "prettier --write",
    "git add"
  ],
  
  // Tailwind CSS check for TypeScript/JavaScript files
  "**/*.{ts,tsx}": [
    "npx tailwindcss-classnames-order --fix"
  ]
};