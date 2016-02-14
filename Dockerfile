FROM node:4.2.2

COPY package.json /src/package.json
RUN cd /src; npm install

COPY . /app

EXPOSE 3000

WORKDIR /app
CMD ["npm", "start"]
