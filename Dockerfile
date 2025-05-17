FROM node:4.2.2 AS build

ENV CONTAINERD_ENABLE_DEPRECATED_PULL_SCHEMA_1_IMAGE=1

WORKDIR /app

COPY package.json package.json

RUN npm install

COPY . .

ENTRYPOINT [ "node", "index.js" ]
