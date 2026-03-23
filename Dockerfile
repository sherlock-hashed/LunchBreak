# ==========================================
# Stage 1: Build the React Frontend
# ==========================================
FROM node:18-alpine AS frontend-builder
WORKDIR /app

# Install frontend dependencies
COPY package*.json ./
RUN npm install

# Build the React application
COPY . .
RUN npm run build

# ==========================================
# Stage 2: Final Unified Container
# ==========================================
FROM node:18-alpine
WORKDIR /app

# Set Node environment to production so Express knows to serve the React files
ENV NODE_ENV=production

# Install backend dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --production

# Copy backend source code
COPY server/ ./server/

# Copy the built React application from Stage 1 into the /app/dist folder
COPY --from=frontend-builder /app/dist ./dist/

# Expose connection port
EXPOSE 5000

# Start unified Node.js server
CMD ["node", "server/index.js"]
