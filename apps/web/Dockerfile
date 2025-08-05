# =============================================================================
# Xaheen CLI Ecosystem Web App - Production Docker Image
# Multi-stage build for optimal size and security
# =============================================================================

# =============================================================================
# Stage 1: Base Node.js Image
# =============================================================================
FROM node:20-alpine AS base

# Install system dependencies required for Node.js native modules
RUN apk add --no-cache \
    libc6-compat \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# =============================================================================
# Stage 2: Dependencies Installation
# =============================================================================
FROM base AS deps

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install pnpm globally
RUN npm install -g pnpm@latest

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# =============================================================================
# Stage 3: Build Application
# =============================================================================
FROM base AS builder

# Install pnpm
RUN npm install -g pnpm@latest

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install all dependencies (including dev dependencies)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Set build environment variables
ARG NODE_VERSION
ARG BUILD_DATE
ARG GIT_SHA
ARG GIT_REF

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_BUILD_ID=$GIT_SHA

# Build the application
RUN pnpm build

# Remove dev dependencies after build
RUN pnpm prune --prod

# =============================================================================
# Stage 4: Production Runtime
# =============================================================================
FROM base AS runner

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Security hardening
RUN apk add --no-cache \
    tini \
    && rm -rf /var/cache/apk/*

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy production dependencies
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Create necessary directories with proper permissions
RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next/cache
RUN mkdir -p /tmp/cache && chown -R nextjs:nodejs /tmp/cache

# Health check configuration
COPY --chown=nextjs:nodejs <<EOF /app/healthcheck.js
const http = require('http');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/api/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

req.on('error', () => {
  process.exit(1);
});

req.on('timeout', () => {
  req.destroy();
  process.exit(1);
});

req.end();
EOF

# Set up health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node /app/healthcheck.js

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Environment variables
ENV PORT=3000
ENV HOSTNAME=\"0.0.0.0\"

# Set cache directory
ENV NEXT_CACHE_DIR=/tmp/cache

# Labels for better container management
LABEL org.opencontainers.image.title=\"Xaheen CLI Ecosystem Web App\"
LABEL org.opencontainers.image.description=\"Next.js web application for Xaheen CLI Ecosystem\"
LABEL org.opencontainers.image.version=$GIT_SHA
LABEL org.opencontainers.image.created=$BUILD_DATE
LABEL org.opencontainers.image.source=\"https://github.com/xaheen/xaheen\"
LABEL org.opencontainers.image.licenses=\"MIT\"
LABEL org.opencontainers.image.vendor=\"Xala Technologies\"

# Use tini as entrypoint for proper signal handling
ENTRYPOINT [\"tini\", \"--\"]

# Start the application
CMD [\"dumb-init\", \"node\", \"server.js\"]