# Build stage
FROM node:17 AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig*.json ./
COPY ./src ./src
RUN npm ci --quiet && npm run build


# Production stage
FROM node:17-alpine
LABEL org.opencontainers.image.source="https://github.com/Hense94/followers-follower"

WORKDIR /app
ENV NODE_ENV=production
ENV DEBUG=false

COPY package*.json ./
RUN npm ci --quiet --only=production

COPY --from=builder /usr/src/app/dist ./dist

CMD [ "node", "dist/index.js" ]
