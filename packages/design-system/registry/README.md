# Xaheen Component Registry

A professional component registry for the Xaheen Design System, compatible with shadcn/ui CLI and enhanced with Norwegian enterprise features.

## Features

- 🎨 **shadcn/ui v4 Compatible** - Works with the latest shadcn CLI
- 🇳🇴 **Norwegian Enterprise Ready** - NSM classifications, BankID/Altinn templates
- ♿ **WCAG AAA Compliant** - All components meet highest accessibility standards
- 🎭 **Multi-Platform Support** - React, Next.js, Vue, Angular, Svelte, Electron, React Native
- 🔒 **Security First** - Built-in NSM security classifications
- 📦 **Universal Items** - Distribute any file type (configs, templates, etc.)
- 🎯 **Type Safe** - Full TypeScript support with strict typing

## Usage

### Install Components

```bash
# Using Xaheen CLI
xaheen registry add button input card

# Using shadcn CLI
npx shadcn@latest add https://xaheen.io/r/button.json

# From local registry
xaheen registry add button --local packages/design-system/dist/registry
```

### List Available Components

```bash
xaheen registry list

# Filter by category
xaheen registry list --category components

# Filter by platform
xaheen registry list --platform react

# Filter by NSM classification
xaheen registry list --nsm RESTRICTED
```

### Search Registry

```bash
xaheen registry search auth
xaheen registry search norwegian
```

## Registry Structure

```
registry/
├── registry.json          # Main registry configuration
├── components/           # Component files
│   ├── button/
│   ├── input/
│   └── card/
├── items/               # Universal items (v4 feature)
│   ├── eslint-config.json
│   └── norwegian-starter.json
├── hooks/               # React hooks
├── utils/               # Utility functions
├── styles/              # Style files
└── blocks/              # Complex UI blocks
```

## Component Categories

- **components** - Basic UI components
- **data-components** - Data display components
- **theme-components** - Theme-related components
- **layouts** - Layout components
- **providers** - Context providers
- **patterns** - UI patterns
- **tools** - Developer tools

## NSM Classifications

All components support Norwegian NSM security classifications:

- 🟢 **OPEN** - Public information
- 🟡 **RESTRICTED** - Limited distribution
- 🔴 **CONFIDENTIAL** - Confidential information
- ⚫ **SECRET** - Secret information

## v4 Features

### Universal Items

Create any type of configuration or template:

```json
{
  "$schema": "https://xaheen.io/schemas/registry-item.schema.json",
  "name": "my-config",
  "type": "registry:item",
  "files": [
    {
      "path": "config/tsconfig.json",
      "type": "registry:file",
      "target": "~/tsconfig.json",
      "content": "..."
    }
  ]
}
```

### CSS Variables

Define theme variables for light/dark modes:

```json
{
  "cssVars": {
    "theme": {
      "font-heading": "Inter, sans-serif"
    },
    "light": {
      "primary": "220 89% 56%"
    },
    "dark": {
      "primary": "217 91% 60%"
    }
  }
}
```

### Post-Install Documentation

Add helpful messages for users:

```json
{
  "docs": "Remember to set up your BankID credentials in .env.local"
}
```

### Categories & Metadata

Improve discoverability:

```json
{
  "categories": ["auth", "norwegian", "enterprise"],
  "meta": {
    "compliance": ["GDPR", "WCAG AAA"],
    "minVersion": "3.0.0"
  }
}
```

## Norwegian Templates

### BankID Authentication

```bash
xaheen registry add norwegian-starter
```

Includes:
- BankID integration setup
- Altinn API helpers
- NSM security headers
- GDPR compliance utilities

## Building the Registry

```bash
# Build registry files
npm run build:registry

# Serve locally
xaheen registry serve --port 3333
```

## API Endpoints

When running in Next.js:

- `GET /api/registry` - Registry index
- `GET /api/registry/[name]` - Individual items
- `GET /r/[name].json` - Static files (rewrites to API)

## Contributing

1. Add components to `registry/components/`
2. Update `registry.json`
3. Run `npm run build:registry`
4. Test with `xaheen registry list`

## License

MIT © Xaheen Technologies