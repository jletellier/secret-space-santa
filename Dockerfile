FROM node:8-jessie

COPY ./build/bundle /usr/src/app
RUN cd /usr/src/app/programs/server && npm install

EXPOSE 80

WORKDIR /usr/src/app
CMD node main.js
