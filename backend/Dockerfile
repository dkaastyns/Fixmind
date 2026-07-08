FROM oven/bun:1.3-alpine AS builder
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:1.3-alpine
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lockb ./
RUN bun install --frozen-lockfile --production
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["bun", "run", "dist/main.js"]
