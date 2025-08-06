# final-test

This is a monorepo project created with Xaheen CLI v3.0.0.

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start development servers:
   ```bash
   pnpm dev
   ```

3. Add more apps:
   ```bash
   xaheen add app <name> --platform <web|mobile|desktop>
   ```

## Project Structure

- `apps/` - Applications (web, mobile, desktop)
- `packages/` - Shared packages and libraries
- `xaheen.config.json` - Unified CLI configuration

## Commands

- `xaheen service add <service>` - Add a service
- `xaheen component generate "<description>"` - Generate AI components
- `xaheen add app <name>` - Add new application
- `xaheen validate` - Validate project structure
