FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .

RUN pnpm run build:icons
RUN pnpm run build

# Debug: listar contenido del output
RUN ls -la .output/ || echo "No .output directory"
RUN ls -la .output/public || echo "No public directory"

FROM nginx:alpine
COPY --from=builder /app/.output/public /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
