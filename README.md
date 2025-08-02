# Xaheen

A modern CLI tool for scaffolding end-to-end type-safe TypeScript projects with best practices and customizable configurations

## Quick Start

```bash
# Using npm
npx xaheen@latest

# Using bun
bun create xaheen@latest

# Using pnpm
pnpm create xaheen@latest
```

## Features

- **Zero-config setup** with interactive CLI wizard
- **End-to-end type safety** from database to frontend via tRPC
- **Modern stack** with React, Hono/Elysia, and TanStack libraries
- **Multi-platform** supporting web, mobile (Expo), and desktop applications
- **Database flexibility** with SQLite (Turso) or PostgreSQL options
- **ORM choice** between Drizzle or Prisma
- **Built-in authentication** with Xaheen-Auth
- **Optional PWA support** for installable web applications
- **Desktop app capabilities** with Tauri integration
- **Monorepo architecture** powered by Turborepo

## Repository Structure

This repository is organized as a monorepo containing:

- **CLI**: [`xaheen`](apps/cli) - The scaffolding CLI tool
- **Documentation**: [`web`](apps/web) - Official website and documentation

## Documentation

Visit [Xaheen.dev](https://Xaheen.dev) for full documentation, guides, and examples.

## Development

```bash
# Clone the repository
git clone https://github.com/Xaheen/xaheen.git

# Install dependencies
bun install

# Start CLI development
bun dev:cli

# Start website development
bun dev:web
```