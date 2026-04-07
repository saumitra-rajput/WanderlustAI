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

CMD ["node", "app.js"]


