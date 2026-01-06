# ---------- DEPS ----------
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./

# prevent postinstall (prisma generate) from running before schema exists
RUN npm ci --ignore-scripts

# ---------- BUILD ----------
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma generate doesn't need DATABASE_URL - it only needs the schema
RUN npx prisma generate

# Next.js build doesn't need DATABASE_URL since pages are dynamic (rendered at request time)
RUN npm run build

# ---------- RUNTIME ----------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Azure injects PORT at runtime; default to 8080 for local/container
ENV PORT=8080

# Copy standalone output from builder (smaller image size)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

EXPOSE 8080

# Run Next.js production server on the PORT Azure provides
# DATABASE_URL will be provided at runtime via Azure App Service environment variables
CMD ["sh", "-c", "node server.js -p ${PORT}"]
