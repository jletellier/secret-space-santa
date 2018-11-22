FROM mhart/alpine-node:8

RUN apk add --no-cache make gcc g++ python

COPY ./build/bundle /usr/src/app
RUN cd /usr/src/app/programs/server && npm install

EXPOSE 80

WORKDIR /usr/src/app
CMD node main.js
