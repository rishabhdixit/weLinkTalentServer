FROM node:7.2.1
MAINTAINER James Santos <icqhv.santos@gmail.com>

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json yarn.lock /usr/src/app/
RUN npm install
COPY . /usr/src/app

EXPOSE 8080
CMD [ "npm", "start" ]
