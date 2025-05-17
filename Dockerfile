FROM node:23-alpine AS build

WORKDIR /app

COPY package.json package.json

RUN npm ci --only=production

COPY . .

FROM gcr.io/distroless/nodejs24-debian12

COPY --from=build /app/index.js /app/package.json /app/src/ /app/

RUN npm ci --only=production

ENTRYPOINT [ "node", "index.js" ]