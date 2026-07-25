FROM node:20-slim AS builder

WORKDIR /app

# Install openssl for Prisma
RUN apt-get update -y && apt-get install -y openssl

# Copy package files from root (since it's a monorepo)
COPY package*.json ./
COPY services/api/package*.json ./services/api/

# Install reproducible dependencies
RUN npm ci

# Copy source
COPY services/api ./services/api
COPY tsconfig.json ./

# Generate Prisma client
WORKDIR /app/services/api
RUN npx prisma generate

# Build
RUN npm run build

FROM node:20-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/services/api/node_modules ./services/api/node_modules
COPY --from=builder /app/services/api/dist ./services/api/dist
COPY --from=builder /app/services/api/package*.json ./services/api/
COPY --from=builder /app/services/api/prisma ./services/api/prisma
COPY --from=builder /app/services/api/src ./services/api/src

# Install tsx globally or just use npx
WORKDIR /app/services/api

EXPOSE 4000

CMD ["node", "dist/index.js"]
