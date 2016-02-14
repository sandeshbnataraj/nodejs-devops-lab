FROM node:4.2.2

COPY package.json /app/package.json
RUN cd /app; npm install

COPY . /app

EXPOSE 3000

WORKDIR /app
CMD ["npm", "start"]
