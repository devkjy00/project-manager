# Multi-stage Dockerfile for Project Manager
# Stage 1: Build Frontend (React + Vite)
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build frontend
RUN npm run build

# Stage 2: Build Backend (Hono + TypeScript)
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./
RUN npm ci

# Copy backend source
COPY backend/ ./

# Build backend
RUN npm run build

# Stage 3: Production Runtime
FROM node:20-alpine

WORKDIR /app

# Copy backend build and dependencies
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/package*.json ./backend/
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules

# Copy frontend build to backend's expected location
COPY --from=frontend-builder /app/frontend/dist ./backend/frontend/dist

WORKDIR /app/backend

EXPOSE 3000

CMD ["npm", "start"]
