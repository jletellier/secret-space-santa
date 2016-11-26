FROM debian

RUN apt-get update
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_4.x | bash -
RUN apt-get install -y nodejs
RUN apt-get install -y build-essential

COPY ./build/bundle /usr/src/app
RUN cd /usr/src/app/programs/server && npm install

EXPOSE 80

WORKDIR /usr/src/app
CMD node main.js