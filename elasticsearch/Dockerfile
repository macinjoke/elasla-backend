ARG ELK_VERSION

# https://github.com/elastic/elasticsearch-docker
FROM docker.elastic.co/elasticsearch/elasticsearch-oss:${ELK_VERSION}

WORKDIR /app

ADD . /app

RUN elasticsearch-plugin install analysis-kuromoji
