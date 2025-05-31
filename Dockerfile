# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and config files first
COPY package*.json tsconfig*.json ./

# Copy source code
COPY . .

# Install dependencies and build
RUN npm ci --ignore-scripts && npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install dependencies for Sharp (image processing)
RUN apk add --no-cache vips-dev

# Copy only production dependencies
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy built application
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=9999

# Expose port
EXPOSE 9999

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- "http://localhost:${PORT:-3333}/health" || exit 1

# Start the server
CMD ["node", "dist/index.js"]
