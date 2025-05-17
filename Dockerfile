FROM node:23-alpine AS build

WORKDIR /app

COPY package.json package.json

RUN npm install

COPY . .

ENTRYPOINT [ "node", "index.js" ]