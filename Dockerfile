FROM node:6.11.1-slim
MAINTAINER Asbjørn Thegler <devops@deranged.dk>

RUN apt-get update
RUN apt-get install git-core -y

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY .git /usr/src/app/.git
RUN echo { \"commit\": \"`git rev-parse HEAD`\" } >> commit.json
RUN rm -rf .git

# Install app dependencies
COPY . /usr/src/app
RUN npm install

EXPOSE 3000

ENV NODE_ENV production

CMD [ "npm", "start" ]
