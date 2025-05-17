FROM node:23-alpine AS build

WORKDIR /app

COPY package.json package.json

RUN npm install --package-lock-only
#ENV NODE_ENV=production  alos an option instead of omit
RUN npm ci --omit=dev

COPY . .

FROM gcr.io/distroless/nodejs24-debian12

WORKDIR /app

COPY --from=build /app/index.js /app/src /app/node_modules ./

ENTRYPOINT [ "node", "index.js" ]