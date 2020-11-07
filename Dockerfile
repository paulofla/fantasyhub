FROM node:14.15.0-buster

RUN mkdir /app && cd /app
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install
COPY . /app

ENTRYPOINT ["node", "/app/server.js"]