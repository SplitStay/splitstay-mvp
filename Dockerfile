# Use Node.js 22 Alpine as base image (latest LTS)
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Keep vite dependencies for production until we fix the bundling
# RUN npm ci --omit=dev && npm cache clean --force

# Expose port (application runs on 5000)
EXPOSE 5000

# Start the application
CMD ["npm", "start"]