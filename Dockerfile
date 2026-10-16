# ============================================================================
# Dockerfile for Plain (Google Cloud Run Ready)
# Multi-stage build for optimal performance, minimal image size, and security
# ============================================================================

# Stage 1: Build client assets
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first for Docker caching
COPY package.json ./
RUN npm install

# Copy source code
COPY . .

# Build client-side assets to /app/dist
RUN npm run build

# ============================================================================
# Stage 2: Production runtime environment
# ============================================================================
FROM node:22-alpine AS runner

WORKDIR /app

# Production environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Copy package definitions and install production packages + tsx runtime
COPY package.json ./
RUN npm install --omit=dev && npm install -g tsx

# Copy compiled frontend from builder
COPY --from=builder /app/dist ./dist

# Copy backend server code and configuration
COPY server.ts ./
COPY tsconfig.json ./

# Cloud Run defaults to port 8080
EXPOSE 8080

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Launch the secure Express + Vite server
CMD ["tsx", "server.ts"]
