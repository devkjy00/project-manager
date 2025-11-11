# Backend Dockerfile - Hono + TypeScript
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS backend-runner

WORKDIR /app

# Copy backend build
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/package*.json ./backend/
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules

WORKDIR /app/backend

EXPOSE 3000

CMD ["npm", "start"]
