FROM node:24.18.0-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:24.18.0-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.svelte-kit ./.svelte-kit
COPY --from=build /app/static ./static
COPY --from=build /app/vite.config.ts ./vite.config.ts

EXPOSE 5173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
