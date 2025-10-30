FROM node:22 AS builder

ARG VITE_APP_URL_API

ENV VITE_APP_URL_API=$VITE_APP_URL_API

WORKDIR /app

RUN npm install -g pnpm

COPY package.json ./

RUN pnpm install

COPY . .

RUN pnpm build

FROM node:22 AS runner

WORKDIR /app

ARG VITE_APP_URL_API

ENV VITE_APP_URL_API=$VITE_APP_URL_API

COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules

RUN npm install -g pnpm

RUN pnpm install

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["pnpm", "serve", "--port", "3000", "--host", "0.0.0.0"]