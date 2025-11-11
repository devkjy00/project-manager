# Frontend Dockerfile - React + Vite
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build for production
RUN npm run build

# The output will be in /app/dist
