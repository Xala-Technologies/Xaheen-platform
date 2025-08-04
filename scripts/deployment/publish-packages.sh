#!/bin/bash

# Xaheen Monorepo - Package Publishing Script
# Publishes CLI package to GitHub Packages

set -e

echo "📦 Publishing Xaheen CLI Package..."

# Define colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[PUBLISH]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get the root directory
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

# Check if we're authenticated with GitHub Packages
if ! npm whoami --registry=https://npm.pkg.github.com &>/dev/null; then
    print_error "Not authenticated with GitHub Packages"
    print_status "Please run: npm login --registry=https://npm.pkg.github.com"
    exit 1
fi

# Build packages first
print_status "Building packages before publishing..."
./scripts/build/build-all.sh

# Publish CLI
print_status "Publishing Xaheen CLI..."
cd packages/cli
if npm publish --registry=https://npm.pkg.github.com; then
    CLI_VERSION=$(node dist/index.js --version)
    print_success "Xaheen CLI published successfully (version: $CLI_VERSION)"
else
    print_error "CLI publishing failed"
    exit 1
fi

# Return to root
cd "$ROOT_DIR"

print_success "Package published successfully!"
print_status "Published package:"
print_status "  - @xala-technologies/xaheen-cli@$CLI_VERSION"