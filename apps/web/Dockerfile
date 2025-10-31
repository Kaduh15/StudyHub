# Stage 1 - Build
FROM node:22 AS builder
WORKDIR /app

ARG VITE_APP_URL_API
ENV VITE_APP_URL_API=$VITE_APP_URL_API

COPY package.json ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build

# Stage 2 - Runtime (nginx)
FROM nginx:stable-alpine AS runner
WORKDIR /usr/share/nginx/html

# Copia os arquivos compilados
COPY --from=builder /app/dist .
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
