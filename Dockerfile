FROM node:23-alpine AS build

WORKDIR /app

COPY package.json package.json

RUN npm install --package-lock-only

RUN npm ci --omit=dev

COPY . .

FROM gcr.io/distroless/nodejs24-debian12

WORKDIR /app

COPY --from=build /app/index.js ./
COPY --from=build /app/src/ ./src/


ENTRYPOINT [ "node", "index.js" ]