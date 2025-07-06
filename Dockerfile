FROM node:lts-alpine as API

WORKDIR /api

COPY package.*json /api/
COPY .env /api/
COPY . .

RUN apk update && apk add bash && npm install

CMD [ "npx","nodemon","./src/App.js" ]