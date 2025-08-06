#!/bin/bash

# Architecture Fix Script - Bash Version
# Automatically applies architecture rules to all components and blocks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
COMPONENTS_DIR="registry/components"
BLOCKS_DIR="registry/blocks"
BACKUP_DIR="backups/$(date +%Y-%m-%d)"

# Options
DRY_RUN=false
VERBOSE=false
SKIP_BACKUP=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --verbose|-v)
      VERBOSE=true
      shift
      ;;
    --skip-backup)
      SKIP_BACKUP=true
      shift
      ;;
    --help|-h)
      echo -e "${BLUE}🏗️  Architecture Fix Script${NC}"
      echo ""
      echo "Usage: ./scripts/fix-architecture.sh [options]"
      echo ""
      echo "Options:"
      echo "  --dry-run       Show what would be changed without making changes"
      echo "  --verbose, -v   Show detailed output"
      echo "  --skip-backup   Skip creating backup files"
      echo "  --help, -h      Show this help message"
      echo ""
      echo "Examples:"
      echo "  ./scripts/fix-architecture.sh                    # Fix all files"
      echo "  ./scripts/fix-architecture.sh --dry-run          # Preview changes"
      echo "  ./scripts/fix-architecture.sh --verbose          # Detailed output"
      echo "  ./scripts/fix-architecture.sh --skip-backup -v   # No backup, verbose"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}🚀 Starting Architecture Fix Script...${NC}\n"

# Function to log verbose messages
log_verbose() {
  if [ "$VERBOSE" = true ]; then
    echo -e "${YELLOW}  $1${NC}"
  fi
}

# Function to fix imports in a file
fix_imports() {
  local file="$1"
  local temp_file=$(mktemp)
  
  # Fix @/ alias imports to relative imports
  sed -E "s|import \{ cn \} from ['\"]@/.*?utils['\"];?|import { cn } from '../../lib/utils';|g" "$file" > "$temp_file"
  
  # Fix component imports
  sed -E "s|import.*from ['\"]@/components/([^'\"]*)['\"];?|// TODO: Fix component import|g" "$temp_file" > "$file"
  
  # Add constants import if needed
  if grep -q "LABELS\|PLACEHOLDERS\|ARIA_LABELS" "$file" && ! grep -q "from '../../lib/constants'" "$file"; then
    sed -i "1 a\\import { LABELS, PLACEHOLDERS, ARIA_LABELS } from '../../lib/constants';" "$file"
  fi
  
  rm "$temp_file"
}

# Function to fix design tokens
fix_design_tokens() {
  local file="$1"
  
  # Color token fixes
  sed -i 's/bg-blue-500/bg-primary/g' "$file"
  sed -i 's/bg-blue-600/bg-primary/g' "$file"
  sed -i 's/text-white/text-primary-foreground/g' "$file"
  sed -i 's/bg-gray-100/bg-muted/g' "$file"
  sed -i 's/text-gray-600/text-muted-foreground/g' "$file"
  sed -i 's/bg-red-500/bg-destructive/g' "$file"
  sed -i 's/text-red-500/text-destructive/g' "$file"
  sed -i 's/border-gray-300/border-border/g' "$file"
  sed -i 's/bg-white/bg-background/g' "$file"
  sed -i 's/text-black/text-foreground/g' "$file"
  
  # Professional sizing fixes
  sed -i 's/h-8\([^0-9]\)/h-12\1/g' "$file"  # Minimum 48px buttons
  sed -i 's/h-9\([^0-9]\)/h-12\1/g' "$file"
  sed -i 's/h-10\([^0-9]\)/h-12\1/g' "$file"
  sed -i 's/px-2\([^0-9]\)/px-4\1/g' "$file"  # Minimum padding
  sed -i 's/py-1\([^0-9]\)/py-3\1/g' "$file"
  sed -i 's/text-xs/text-sm/g' "$file"  # Minimum readable text
}

# Function to fix hardcoded text
fix_hardcoded_text() {
  local file="$1"
  
  # Common text replacements
  sed -i 's/"Close"/LABELS.close/g' "$file"
  sed -i 's/"Open"/LABELS.open/g' "$file"
  sed -i 's/"Save"/LABELS.save/g' "$file"
  sed -i 's/"Cancel"/LABELS.cancel/g' "$file"
  sed -i 's/"Search"/LABELS.search/g' "$file"
  sed -i 's/"Filter"/LABELS.filter/g' "$file"
  sed -i 's/"Loading"/LABELS.loading/g' "$file"
  sed -i 's/"Apply"/LABELS.apply/g' "$file"
  sed -i 's/"Reset"/LABELS.reset/g' "$file"
  
  # Placeholder replacements
  sed -i 's/"Search..."/PLACEHOLDERS.searchEverything/g' "$file"
  sed -i 's/"Type here..."/PLACEHOLDERS.typeHere/g' "$file"
  sed -i 's/"Enter email"/PLACEHOLDERS.enterEmail/g' "$file"
}

# Function to add readonly to interfaces
fix_interfaces() {
  local file="$1"
  
  # Add readonly to interface properties
  sed -i -E 's/^(\s+)([a-zA-Z_][a-zA-Z0-9_]*\??):\s/\1readonly \2: /g' "$file"
}

# Function to add explicit return types
fix_return_types() {
  local file="$1"
  
  # Add JSX.Element return type where missing
  sed -i -E 's/= \(([^)]*)\) => \{/= (\1): JSX.Element => {/g' "$file"
  sed -i -E 's/= \(([^)]*)\) =>/= (\1): JSX.Element =>/g' "$file"
}

# Function to process a single file
process_file() {
  local file="$1"
  local file_type="$2"
  local base_name=$(basename "$(dirname "$file")")
  
  log_verbose "Processing $file_type: $base_name"
  
  if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}[DRY RUN] Would fix: $file${NC}"
    return
  fi
  
  # Apply all fixes
  fix_imports "$file"
  fix_design_tokens "$file"
  fix_hardcoded_text "$file"
  fix_interfaces "$file"
  fix_return_types "$file"
  
  log_verbose "✅ Fixed $base_name"
}

# Create backups
create_backups() {
  if [ "$SKIP_BACKUP" = true ]; then
    return
  fi
  
  echo -e "${BLUE}💾 Creating backups in $BACKUP_DIR...${NC}"
  
  # Find all TypeScript files
  find "$COMPONENTS_DIR" "$BLOCKS_DIR" -name "*.tsx" -type f | while read -r file; do
    backup_path="$BACKUP_DIR/$file"
    mkdir -p "$(dirname "$backup_path")"
    cp "$file" "$backup_path"
  done
  
  echo -e "${GREEN}✅ Backups created${NC}\n"
}

# Main execution
main() {
  # Check if directories exist
  if [ ! -d "$COMPONENTS_DIR" ] || [ ! -d "$BLOCKS_DIR" ]; then
    echo -e "${RED}❌ Component or block directories not found${NC}"
    echo "Run this script from the design system root directory"
    exit 1
  fi
  
  # Create backups
  if [ "$DRY_RUN" = false ]; then
    create_backups
  fi
  
  # Count files
  component_count=$(find "$COMPONENTS_DIR" -name "*.tsx" -type f | wc -l)
  block_count=$(find "$BLOCKS_DIR" -name "*.tsx" -type f | wc -l)
  total_count=$((component_count + block_count))
  
  echo -e "${BLUE}📁 Found $total_count files to process ($component_count components, $block_count blocks)${NC}\n"
  
  # Process components
  echo -e "${BLUE}🔧 Processing components...${NC}"
  find "$COMPONENTS_DIR" -name "*.tsx" -type f | while read -r file; do
    process_file "$file" "component"
  done
  
  # Process blocks
  echo -e "${BLUE}🔧 Processing blocks...${NC}"
  find "$BLOCKS_DIR" -name "*.tsx" -type f | while read -r file; do
    process_file "$file" "block"
  done
  
  if [ "$DRY_RUN" = true ]; then
    echo -e "\n${YELLOW}🔍 Dry run completed. No files were modified.${NC}"
    echo -e "${YELLOW}Run without --dry-run to apply changes.${NC}"
  else
    echo -e "\n${GREEN}✅ Architecture fix completed successfully!${NC}"
    echo -e "${GREEN}📝 Check the changes and test your components.${NC}"
    
    if [ "$SKIP_BACKUP" = false ]; then
      echo -e "${BLUE}💾 Backups saved in: $BACKUP_DIR${NC}"
    fi
  fi
}

# Run main function
main