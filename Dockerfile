FROM node:4.2.2 AS build

WORKDIR /app

COPY package.json package.json

RUN npm install

COPY . .

ENTRYPOINT [ "node", "index.js" ]
