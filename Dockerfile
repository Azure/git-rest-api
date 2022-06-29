# Base Stage
FROM mcr.microsoft.com/mirror/docker/library/ubuntu:18.04 as base

RUN mkdir /app
WORKDIR /app

ENV PKG_ADD="curl"
ENV PKG_ADD_BUILD="libkrb5-dev krb5-config gcc g++ make"
RUN apt update && apt upgrade -y && apt install $PKG_ADD -y
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash - && apt install nodejs -y

# Build Stage
FROM base AS builder
RUN apt install $PKG_ADD_BUILD -y

COPY package.json package-lock.json .prettierrc.yml ./
RUN npm ci

COPY . .
RUN npm run build
ARG SKIP_TEST
RUN if [ -z "${SKIP_TEST}" ]; then npm run test; fi 
RUN npm prune --production 


# Prod Stage
FROM base as prod

COPY package.json package-lock.json ./
COPY --from=builder /app/bin ./bin
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3009

ENV NODE_ENV=production
CMD npm run start:prod