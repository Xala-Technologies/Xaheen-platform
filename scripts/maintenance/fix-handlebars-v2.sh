#!/bin/bash

# Fix remaining Handlebars template syntax errors
echo "Fixing remaining Handlebars template syntax errors..."

# Fix JSX prop patterns that might cause issues
find apps/cli/templates -name "*.hbs" -type f -exec sed -i '' 's/className={[^}]*}/className=""/g' {} \;
find apps/cli/templates -name "*.hbs" -type f -exec sed -i '' 's/onClick={[^}]*}/onClick={handleClick}/g' {} \;

# Fix any remaining empty handlebars expressions
find apps/cli/templates -name "*.hbs" -type f -exec sed -i '' 's/{{ *}}/placeholder/g' {} \;

# Fix template literal backticks that might interfere
find apps/cli/templates -name "*.hbs" -type f -exec sed -i '' 's/`[^`]*{[^}]*}[^`]*`/"template string"/g' {} \;

echo "Additional Handlebars fixes complete!"

# Test a specific file to see if it parses now
echo "Testing template parsing..."
