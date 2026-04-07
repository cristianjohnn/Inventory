# =====================
# Nginx Dockerfile
# Multi-stage: builds React app, then serves via Nginx
# =====================

# Stage 1: Build React app
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files for layer caching
COPY client/package*.json ./
RUN npm ci

# Copy source and build
COPY client/ ./
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built React app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
