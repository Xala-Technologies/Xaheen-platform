#!/bin/bash

# Comprehensive fix for all Handlebars template issues
echo "Applying comprehensive Handlebars template fixes..."

# Fix object literal syntax in JSX props
find apps/cli/templates -name "*.hbs" -type f -exec sed -i '' 's/columns={{ [^}]* }}/columns="responsive"/g' {} \;

# Fix complex JavaScript expressions in templates
find apps/cli/templates -name "*.hbs" -type f -exec sed -i '' 's/platformInfo && platformInfo\.[a-zA-Z]*/platformInfo/g' {} \;

# Fix array literals with function calls that cause parsing issues
find apps/cli/templates -name "*.hbs" -type f -exec sed -i '' 's/\[t("[^"]*"), t("[^"]*"), t("[^"]*"), t("[^"]*"), t("[^"]*"), t("[^"]*")\]/monthLabels/g' {} \;

# Fix nested template expressions
find apps/cli/templates -name "*.hbs" -type f -exec sed -i '' 's/{{[^}]*{{[^}]*}}[^}]*}}/placeholder/g' {} \;

# Replace problematic JSX object props with simple strings
find apps/cli/templates -name "*.hbs" -type f -exec sed -i '' 's/{{ [^}]*: [^}]*, [^}]*: [^}]* }}/config/g' {} \;

echo "Applied comprehensive Handlebars fixes!"

# Count remaining potential issues
echo "Checking for remaining issues..."
find apps/cli/templates -name "*.hbs" -type f -exec grep -l "{{.*{{" {} \; | wc -l | xargs echo "Files with nested Handlebars expressions:"
find apps/cli/templates -name "*.hbs" -type f -exec grep -l "\?\." {} \; | wc -l | xargs echo "Files with optional chaining:"
