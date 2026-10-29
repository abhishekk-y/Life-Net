FROM node:22-bookworm-slim

WORKDIR /app

COPY server/package.json server/package-lock.json ./server/
RUN npm ci --omit=dev --prefix server

COPY client/package.json client/package-lock.json ./client/
RUN npm install --prefix client --no-audit --no-fund

COPY server ./server
COPY client ./client
RUN npm run build --prefix client && npm prune --omit=dev --prefix client

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server/index.js"]
