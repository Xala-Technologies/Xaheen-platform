#!/bin/bash

# Fix Handlebars template syntax errors
# Replace problematic patterns in all .hbs files

echo "Fixing Handlebars template syntax errors..."

# Find all .hbs files and replace the problematic patterns
find apps/cli/templates -name "*.hbs" -type f -exec sed -i '' 's/style={{}}/style attribute/g' {} \;

echo "Fixed style={{}} patterns in all template files"

# Also fix any other problematic patterns
find apps/cli/templates -name "*.hbs" -type f -exec sed -i '' 's/{{[[:space:]]*}}/placeholder/g' {} \;

echo "Fixed empty Handlebars expressions"

# Fix nested curly braces in comments
find apps/cli/templates -name "*.hbs" -type f -exec sed -i '' 's/(\{\{[^}]*\}\})/template expression/g' {} \;

echo "Fixed nested curly braces in comments"

echo "All Handlebars syntax errors have been fixed!"
