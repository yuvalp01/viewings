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
    
   # Provide DATABASE_URL ONLY for build step
    ARG DATABASE_URL
    RUN npx prisma generate
    RUN DATABASE_URL="$DATABASE_URL" npm run build
    
    # ---------- RUNTIME ----------
    FROM node:20-alpine AS runner
    WORKDIR /app
    
    ENV NODE_ENV=production
    # Azure injects PORT at runtime; default to 8080 for local/container
    ENV PORT=8080
    
    # Copy what we need to run "next start"
    COPY --from=builder /app/package.json ./package.json
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/prisma ./prisma
    
    EXPOSE 8080
    
    # Run Next.js production server on the PORT Azure provides
    CMD ["sh", "-c", "node node_modules/.bin/next start -p ${PORT}"]
    