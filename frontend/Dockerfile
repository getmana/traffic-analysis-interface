FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build


FROM node:24-alpine AS runtime

RUN addgroup --system --gid 10001 nodejs \
    && adduser --system --uid 10001 --ingroup nodejs nextjs

WORKDIR /app

# Standalone output does NOT bundle .next/static or public/ — copy explicitly.
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s --start-period=15s --retries=6 \
    CMD ["node", "-e", "require('http').get('http://127.0.0.1:3000/api/health', (r) => { if (r.statusCode === 200) process.exit(0); else process.exit(1); }).on('error', () => process.exit(1))"]

CMD ["node", "server.js"]
