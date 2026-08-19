# Multi-Stage Dockerfile for Vite SPA with Nginx Reverse Proxy on Railway

# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors & install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source code
COPY . .

# Set build-time API URL to relative path /api
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Build static production assets
RUN npm run build

# Stage 2: Production Nginx stage
FROM nginx:1.27-alpine

# Copy built static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx configuration template (processed automatically by nginx docker entrypoint via envsubst)
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Default Railway environment variables
ENV PORT=80
ENV BACKEND_URL=http://inventory-api.railway.internal:3000

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
