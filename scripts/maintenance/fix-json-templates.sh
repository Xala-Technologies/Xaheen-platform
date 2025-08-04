#!/bin/bash

# Fix JSON template files that have JavaScript-style comments
echo "Fixing JSON template files with JavaScript-style comments..."

# Find all .json.hbs files and remove JavaScript-style comment blocks
find apps/cli/templates -name "*.json.hbs" -type f -exec sed -i '' '/^\/\*\*/,/^\*\//d' {} \;

# Also remove any remaining single-line comments that start with //
find apps/cli/templates -name "*.json.hbs" -type f -exec sed -i '' '/^[[:space:]]*\/\//d' {} \;

# Remove empty lines at the beginning of files
find apps/cli/templates -name "*.json.hbs" -type f -exec sed -i '' '/./,$!d' {} \;

echo "Fixed all JSON template files!"

# List the files that were modified
echo "Modified files:"
find apps/cli/templates -name "*.json.hbs" -type f
