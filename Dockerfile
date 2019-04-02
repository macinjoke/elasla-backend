FROM node:10.15-jessie

WORKDIR /app

ADD . /app

RUN apt-get update \
    && apt-get install -y sqlite3 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN yarn

EXPOSE 80

CMD ["yarn", "start"]
