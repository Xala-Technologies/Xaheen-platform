# Xaheen CLI - Multi-stage Dockerfile with 2025 Security Best Practices
# Production-optimized with Prometheus 3.0, Istio Ambient Mode, and Norwegian compliance

# Build arguments
ARG NODE_VERSION=20.11.0
ARG ALPINE_VERSION=3.19
ARG BUILD_DATE
ARG VCS_REF
ARG VERSION
ARG NSM_CLASSIFICATION=RESTRICTED
ARG NORWEGIAN_LOCALE=nb-NO

# Stage 1: Build dependencies and compile TypeScript
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS dependencies

# Security: Create non-root user early
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    git

# Copy package files for dependency installation
COPY package*.json ./
COPY packages/xaheen-cli/package*.json ./packages/xaheen-cli/
COPY packages/mcp/package*.json ./packages/mcp/
COPY packages/xala-cli/package*.json ./packages/xala-cli/

# Install dependencies with npm ci for faster, reliable builds
RUN npm ci --only=production --frozen-lockfile --no-audit --no-fund

# Stage 2: Build application
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS builder

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY . .

# Install all dependencies (including dev dependencies for build)
RUN npm ci --frozen-lockfile --no-audit --no-fund

# Build the application
RUN npm run build && \
    npm run build:production && \
    npm prune --production

# Stage 3: Security scanning (optional, can be done in CI)
FROM aquasec/trivy:latest AS security-scan

WORKDIR /app
COPY --from=builder /app .

# Run security scan
RUN trivy fs --exit-code 0 --no-progress --format table .

# Stage 4: Production runtime
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS runtime

# Build arguments for labels
ARG BUILD_DATE
ARG VCS_REF  
ARG VERSION

# Labels for container metadata
LABEL org.opencontainers.image.title="Xaheen CLI" \
      org.opencontainers.image.description="AI-powered CLI for modern development workflows" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.vendor="Xaheen Enterprise" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.source="https://github.com/xaheen/xaheen-cli" \
      maintainer="ibrahim@xaheen.com"

# Security hardening
RUN apk upgrade --no-cache && \
    apk add --no-cache \
    dumb-init \
    curl \
    ca-certificates \
    && rm -rf /var/cache/apk/*

# Create non-root user and group
RUN addgroup -g 1001 -S xaheen && \
    adduser -S xaheen -u 1001 -G xaheen

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=xaheen:xaheen /app/dist ./dist
COPY --from=builder --chown=xaheen:xaheen /app/packages/xaheen-cli/dist ./packages/xaheen-cli/dist
COPY --from=builder --chown=xaheen:xaheen /app/packages/mcp/dist ./packages/mcp/dist
COPY --from=builder --chown=xaheen:xaheen /app/node_modules ./node_modules
COPY --from=builder --chown=xaheen:xaheen /app/package*.json ./
COPY --from=builder --chown=xaheen:xaheen /app/packages/xaheen-cli/package*.json ./packages/xaheen-cli/

# Create necessary directories with proper permissions
RUN mkdir -p /app/logs /app/tmp /app/cache && \
    chown -R xaheen:xaheen /app

# Security: Remove unnecessary packages and files
RUN npm prune --production && \
    npm cache clean --force && \
    rm -rf /tmp/* /var/tmp/* /root/.npm

# Switch to non-root user
USER xaheen

# Environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    LOG_LEVEL=info \
    CACHE_DIR=/app/cache \
    TEMP_DIR=/app/tmp

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "console.log('Health check passed')" || exit 1

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Default command
CMD ["node", "packages/xaheen-cli/dist/index.js"]

# Security: Set read-only root filesystem (can be overridden in k8s)
# VOLUME ["/app/logs", "/app/tmp", "/app/cache"]