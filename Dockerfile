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

# Inform Render to securely pass the Dashboard Environment Variables into the Docker Build phase
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID

# Expose them to the Vite Compiler
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID

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
