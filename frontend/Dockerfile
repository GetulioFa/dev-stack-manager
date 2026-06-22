# ─── Stage 1: Build Angular app ──────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

# Copy package files first (layer cache optimization)
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

# Copy source and build for production
COPY . .
RUN npm run build -- --configuration production

# ─── Stage 2: Serve with Nginx ───────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config (handles SPA routing + API proxy)
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copy built Angular app
COPY --from=build /app/dist/devstackmanager-web/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
