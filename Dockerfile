FROM node:23-alpine AS build

WORKDIR /app

COPY package.json package.json

RUN npm install --package-lock-only
#ENV NODE_ENV=production  alos an option with npm install to omit dev dependenciss like npm ci
RUN npm ci --omit=dev

COPY . .

#distroless image increases security and reduced size
FROM gcr.io/distroless/nodejs24-debian12 

WORKDIR /app

COPY --from=build /app/index.js /app/src /app/node_modules ./

ENTRYPOINT [ "node", "index.js" ]