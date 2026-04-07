FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .

RUN pnpm run build:icons
RUN pnpm run build

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
