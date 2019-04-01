FROM node:10.15-jessie

WORKDIR /app

ADD . /app

RUN yarn

EXPOSE 80

CMD ["yarn", "start"]
