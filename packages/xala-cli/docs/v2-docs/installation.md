# Xala CLI - Installation & Setup

## 🚀 Installation Guide

The Xala CLI is a powerful multi-platform scaffolding tool that generates professional applications using the Universal Design System v5.0.

## 📋 System Requirements

### Minimum Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher (or yarn v1.22.0+, pnpm v7.0.0+)
- **Git**: v2.28.0 or higher
- **Operating System**: macOS, Linux, Windows 10+

### Recommended Requirements
- **Node.js**: v20.0.0 or higher (LTS)
- **pnpm**: v8.0.0 or higher (preferred package manager)
- **Memory**: 4GB RAM minimum, 8GB recommended
- **Storage**: 2GB free space for templates and cache

### Platform-Specific Requirements

#### For React/Next.js Development
- **React**: v18.0.0 or higher
- **TypeScript**: v5.0.0 or higher
- **ESLint**: v8.0.0 or higher

#### For Vue Development
- **Vue**: v3.3.0 or higher
- **Vite**: v4.0.0 or higher
- **TypeScript**: v5.0.0 or higher

#### For Angular Development
- **Angular CLI**: v16.0.0 or higher
- **TypeScript**: v5.1.0 or higher
- **Node.js**: v18.19.1 or higher

#### For Flutter Development
- **Flutter SDK**: v3.10.0 or higher
- **Dart SDK**: v3.0.0 or higher
- **Android Studio** or **Xcode** (for mobile development)

#### For React Native Development
- **React Native CLI**: v0.72.0 or higher
- **Metro**: v0.76.0 or higher
- **Android Studio** or **Xcode**

## 📦 Installation Methods

### Method 1: NPM Global Installation (Recommended)

```bash
# Install globally with npm
npm install -g @xala-technologies/cli

# Verify installation
xala --version
xala --help
```

### Method 2: Yarn Global Installation

```bash
# Install globally with yarn
yarn global add @xala-technologies/cli

# Verify installation
xala --version
```

### Method 3: PNPM Global Installation

```bash
# Install globally with pnpm
pnpm add -g @xala-technologies/cli

# Verify installation
xala --version
```

### Method 4: NPX (No Installation Required)

```bash
# Use without installing
npx @xala-technologies/cli --version
npx @xala-technologies/cli init my-app --platform react

# Create alias for convenience
alias xala="npx @xala-technologies/cli"
```

### Method 5: Development Installation

```bash
# Clone repository
git clone https://github.com/xala-technologies/ui-system.git
cd ui-system/cli

# Install dependencies
pnpm install

# Build CLI
pnpm run build

# Link for global usage
npm link
# or
pnpm link --global

# Verify installation
xala --version
```

## ⚙️ Initial Configuration

### 1. Global Configuration

Create global configuration file:

```bash
# Create config directory
mkdir -p ~/.xala

# Generate default configuration
xala config init

# Edit configuration
xala config edit
```

### 2. Configuration Options

The global configuration file (`~/.xala/config.json`):

```json
{
  "defaultPlatform": "react",
  "defaultTemplate": "standard",
  "preferences": {
    "packageManager": "pnpm",
    "typescript": true,
    "eslint": true,
    "prettier": true,
    "testing": "jest",
    "storybook": true
  },
  "compliance": {
    "norwegian": false,
    "accessibility": "WCAG_2_1_AA",
    "gdpr": false
  },
  "ai": {
    "enabled": true,
    "provider": "openai",
    "optimizationLevel": "medium"
  },
  "theme": {
    "default": "light",
    "customThemes": []
  },
  "cache": {
    "enabled": true,
    "ttl": 86400,
    "directory": "~/.xala/cache"
  }
}
```

### 3. Environment Variables

Set optional environment variables:

```bash
# Add to your shell profile (~/.bashrc, ~/.zshrc, etc.)

# Package manager preference
export XALA_PACKAGE_MANAGER="pnpm"

# Default platform
export XALA_DEFAULT_PLATFORM="react"

# AI integration
export XALA_AI_ENABLED="true"
export XALA_AI_PROVIDER="openai"
export OPENAI_API_KEY="your-api-key"

# Norwegian compliance
export XALA_NORWEGIAN_COMPLIANCE="true"
export XALA_NSM_CLASSIFICATION="ÅPEN"

# Performance settings
export XALA_CACHE_ENABLED="true"
export XALA_PARALLEL_GENERATION="true"

# Debug settings
export XALA_DEBUG="false"
export XALA_LOG_LEVEL="info"
```

## 🔧 Platform-Specific Setup

### React/Next.js Setup

```bash
# Install React-specific dependencies
npm install -g create-next-app
npm install -g @storybook/cli

# Verify React toolchain
npx create-react-app --version
npx create-next-app --version
```

### Vue Setup

```bash
# Install Vue CLI
npm install -g @vue/cli
npm install -g create-vue

# Verify Vue toolchain
vue --version
```

### Angular Setup

```bash
# Install Angular CLI
npm install -g @angular/cli

# Verify Angular toolchain
ng version
```

### Flutter Setup

```bash
# Verify Flutter installation
flutter doctor

# Install additional tools
flutter pub global activate fvm
flutter pub global activate dart_code_metrics
```

### React Native Setup

```bash
# Install React Native CLI
npm install -g @react-native-community/cli

# Verify installation
npx react-native doctor
```

## 🎯 First-Time Setup Wizard

Run the interactive setup wizard:

```bash
# Launch setup wizard
xala setup

# The wizard will guide you through:
# 1. Platform preferences
# 2. Package manager selection
# 3. Code quality tools setup
# 4. AI integration configuration
# 5. Norwegian compliance settings
# 6. Theme preferences
```

### Wizard Output Example

```bash
$ xala setup

🚀 Welcome to Xala CLI Setup Wizard

✓ Detected Node.js v20.5.0
✓ Detected pnpm v8.6.0
✓ Detected Git v2.41.0

📱 Select your primary platform:
  ○ React
  ○ Vue
  ○ Angular
  ○ Flutter
  ○ React Native
  ○ Svelte

📦 Select package manager:
  ○ npm
  ● pnpm (recommended)
  ○ yarn

🛠️ Code quality tools:
  ● TypeScript (recommended)
  ● ESLint (recommended)
  ● Prettier (recommended)
  ● Jest (testing)
  ○ Storybook

🇳🇴 Norwegian compliance:
  ○ Enable NSM classification
  ○ Enable GDPR compliance
  ● Enable WCAG 2.2 AAA accessibility

🤖 AI integration:
  ● Enable AI-powered generation
  ○ Configure OpenAI API key
  ○ Configure custom AI provider

🎨 Theme preferences:
  ● Light theme (default)
  ○ Dark theme
  ○ High contrast theme

✅ Configuration saved to ~/.xala/config.json
✅ Cache directory created at ~/.xala/cache
✅ Templates downloaded and cached

🎉 Setup complete! Try: xala init my-app --platform react
```

## 🔍 Verification & Testing

### 1. Verify Installation

```bash
# Check version
xala --version
# Output: @xala-technologies/cli v2.0.0

# Check available commands
xala --help

# Check platform support
xala platforms list

# Check template availability
xala templates list
```

### 2. Test Basic Functionality

```bash
# Create test project
xala init test-project --platform react --template basic --dry-run

# Test component generation
xala create component TestButton --variants primary,secondary --dry-run

# Test AI features (if configured)
xala ai create "simple dashboard with cards" --dry-run
```

### 3. Run Diagnostics

```bash
# Run comprehensive diagnostics
xala doctor

# Check specific platform
xala doctor --platform react

# Check configuration
xala config validate

# Check cache status
xala cache status
```

### Diagnostics Output Example

```bash
$ xala doctor

🔍 Xala CLI Diagnostics

Environment:
✓ Node.js v20.5.0 (required: >=18.0.0)
✓ pnpm v8.6.0 (required: >=7.0.0)
✓ Git v2.41.0 (required: >=2.28.0)
✓ TypeScript v5.1.6 (required: >=5.0.0)

CLI Installation:
✓ Xala CLI v2.0.0 installed globally
✓ Configuration file exists at ~/.xala/config.json
✓ Cache directory accessible at ~/.xala/cache
✓ Templates cache populated (45 templates)

Platform Support:
✓ React toolchain available
✓ Vue toolchain available
✓ Angular toolchain available
⚠ Flutter SDK not found (install for Flutter support)
⚠ React Native CLI not found (install for RN support)

AI Integration:
⚠ OpenAI API key not configured (set OPENAI_API_KEY)
✓ AI features available (using fallback)

Norwegian Compliance:
✓ NSM classification support available
✓ GDPR compliance features available
✓ WCAG 2.2 AAA validation available

Recommendations:
• Install Flutter SDK for mobile development
• Configure OpenAI API key for enhanced AI features
• Enable Norwegian compliance if required

✅ Overall health: Good (2 warnings)
```

## 🚨 Troubleshooting

### Common Installation Issues

#### 1. Permission Errors (macOS/Linux)
```bash
# Fix npm permissions
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}

# Or use npm prefix
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

#### 2. Command Not Found
```bash
# Check if CLI is in PATH
which xala

# Check npm global directory
npm config get prefix

# Add to PATH if needed
echo 'export PATH="$(npm config get prefix)/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

#### 3. Version Conflicts
```bash
# Uninstall all versions
npm uninstall -g @xala-technologies/cli
yarn global remove @xala-technologies/cli
pnpm remove -g @xala-technologies/cli

# Clear npm cache
npm cache clean --force

# Reinstall
npm install -g @xala-technologies/cli@latest
```

#### 4. Template Download Failures
```bash
# Clear template cache
xala cache clear

# Redownload templates
xala templates update

# Check network connectivity
xala doctor --verbose
```

#### 5. Platform Detection Issues
```bash
# Manually set platform
export XALA_DEFAULT_PLATFORM="react"

# Update configuration
xala config set defaultPlatform react

# Verify platform toolchain
xala doctor --platform react
```

### Windows-Specific Issues

#### 1. PowerShell Execution Policy
```powershell
# Enable script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Alternatively, use Command Prompt instead of PowerShell
```

#### 2. Long Path Support
```bash
# Enable long path support in Git
git config --system core.longpaths true

# Enable in Windows (requires admin)
# Computer Configuration > Administrative Templates > System > Filesystem
# Enable Win32 long paths
```

#### 3. Node.js Installation
```bash
# Use Node Version Manager for Windows
winget install Schniz.fnm
fnm install 20
fnm use 20
```

## 🔄 Updates & Maintenance

### Update CLI

```bash
# Check for updates
xala update check

# Update to latest version
xala update install

# Or manually with npm
npm update -g @xala-technologies/cli

# Verify update
xala --version
```

### Update Templates

```bash
# Update all templates
xala templates update

# Update specific template category
xala templates update --category react

# Force update (ignore cache)
xala templates update --force
```

### Cache Management

```bash
# View cache status
xala cache status

# Clear cache
xala cache clear

# Clear specific cache
xala cache clear --type templates

# Rebuild cache
xala cache rebuild
```

### Configuration Management

```bash
# View current configuration
xala config show

# Edit configuration
xala config edit

# Reset to defaults
xala config reset

# Backup configuration
xala config backup

# Restore configuration
xala config restore
```

## 📚 Next Steps

After successful installation:

1. **[Commands Reference](./commands.md)** - Learn all CLI commands
2. **[Templates Guide](./templates.md)** - Explore available templates
3. **[Platform Guides](./platforms.md)** - Platform-specific documentation
4. **[Configuration](./configuration.md)** - Advanced configuration options

## 🤝 Support

If you encounter issues:

- **GitHub Issues**: [Report installation problems](https://github.com/xala-technologies/ui-system/issues)
- **Discussions**: [Get help from community](https://github.com/xala-technologies/ui-system/discussions)
- **Documentation**: [Check troubleshooting guides](../troubleshooting.md)

---

*Xala CLI Installation Guide v2.0 - Get started with multi-platform scaffolding*