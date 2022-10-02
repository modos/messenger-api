FROM node:latest
RUN npm install -g nodemon
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./app ./
RUN npm install
EXPOSE 3000