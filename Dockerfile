FROM node:20-alpine AS base

# --- Bot build ---
FROM base AS bot-deps
WORKDIR /app/bot
COPY bot/package.json bot/package-lock.json* ./
RUN npm install

FROM bot-deps AS bot-build
WORKDIR /app/bot
COPY bot/ .
RUN npx prisma generate --schema=src/db/schema.prisma
RUN npm run build

# --- Web build ---
FROM base AS web-deps
WORKDIR /app/web
COPY web/package.json web/package-lock.json* ./
RUN npm install

FROM web-deps AS web-build
WORKDIR /app/web
COPY web/ .
RUN npm run build

# --- Production ---
FROM base AS production
WORKDIR /app

# Bot
COPY --from=bot-build /app/bot/dist ./bot/dist
COPY --from=bot-build /app/bot/node_modules ./bot/node_modules
COPY --from=bot-build /app/bot/package.json ./bot/
COPY --from=bot-build /app/bot/src/db/schema.prisma ./bot/src/db/

# Web
COPY --from=web-build /app/web/.next ./web/.next
COPY --from=web-build /app/web/node_modules ./web/node_modules
COPY --from=web-build /app/web/package.json ./web/
COPY --from=web-build /app/web/public ./web/public

EXPOSE 3000

CMD ["sh", "-c", "cd /app/bot && npx prisma db push --schema=src/db/schema.prisma && node dist/index.js & cd /app/web && npm start"]
