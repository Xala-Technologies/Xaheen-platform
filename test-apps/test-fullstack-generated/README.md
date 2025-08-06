# test-fullstack-generated

This is a full-stack monorepo project created with Xaheen CLI v3.0.0.

## Architecture

- **Frontend**: Next.js application (apps/web)
- **Backend**: Express.js API (apps/api)
- **Shared**: Common packages and types (packages/)

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start all services:
   ```bash
   pnpm dev
   ```

3. Or start services individually:
   ```bash
   pnpm dev:web    # Frontend only (http://localhost:3000)
   pnpm dev:api    # Backend only (http://localhost:3001)
   ```

## Project Structure

- `apps/web/` - Next.js frontend application
- `apps/api/` - Express.js backend API
- `packages/` - Shared packages and libraries
- `turbo.json` - Turborepo configuration
- `package.json` - Root workspace configuration

## API Endpoints

- `GET http://localhost:3001/` - Welcome message
- `GET http://localhost:3001/health` - Health check

## Frontend Routes

- `http://localhost:3000/` - Home page

## Commands

- `pnpm dev` - Start all services in development
- `pnpm build` - Build all applications
- `pnpm start` - Start all applications in production
- `pnpm lint` - Lint all applications
- `pnpm type-check` - Type check all applications
- `pnpm test` - Run tests for all applications

## Development

### Adding New Features
1. Frontend changes: Edit files in `apps/web/`
2. Backend changes: Edit files in `apps/api/`
3. Shared code: Add to `packages/`

### Environment Variables
- Frontend: Create `apps/web/.env.local`
- Backend: Create `apps/api/.env`

## Deployment

This full-stack application can be deployed to various platforms:
- Frontend: Vercel, Netlify, or any static hosting
- Backend: Railway, Render, Heroku, or any Node.js hosting
- Database: Add database services as needed

## Next Steps

1. Set up database integration
2. Add authentication
3. Implement API endpoints
4. Add testing
5. Set up CI/CD pipeline
