# Base Stage
FROM alpine:3.11 as base

RUN mkdir /app
WORKDIR /app

ENV APK_ADD="nodejs-npm krb5-libs"
ENV APK_ADD_BUILD="nodejs-npm python krb5-dev curl-dev build-base libssh2-dev"

RUN apk update && apk upgrade && apk add --no-cache ${APK_ADD}


# Build Stage
FROM base as builder
RUN apk add --no-cache ${APK_ADD_BUILD}
COPY package.json package-lock.json .prettierrc.yml ./
RUN BUILD_ONLY=true JOBS=`nproc` npm ci

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