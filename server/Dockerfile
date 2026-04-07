# =====================
# Server Dockerfile
# Multi-stage build for Express + Prisma
# =====================

FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first for layer caching
COPY server/package*.json ./
RUN npm ci --only=production

# Copy Prisma schema and generate client
COPY server/prisma ./prisma
RUN npx prisma generate

# Copy application code
COPY server/src ./src

# =====================
# Production stage
# =====================
FROM node:22-alpine

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY server/package*.json ./

# Switch to non-root user
USER appuser

EXPOSE 3001

# Run migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]
