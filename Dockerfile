# Builder Stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

# PRODUCTION stage
FROM node:22-alpine

WORKDIR /app

# Non-root user for security
# Alpine uses addgroup / -S (system user/group)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/node_modules ./node_modules

# copy the app source code
COPY . .

# set permissions
RUN chown -R appuser:appgroup /app

# set user
USER appuser

EXPOSE 8080

# Health check optional
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:8080 || exit 1


CMD ["node", "app.js"]


