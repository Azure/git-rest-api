FROM alpine:3.11
RUN apk update
RUN apk upgrade

ENV APK_ADD="nodejs-npm python krb5-dev curl-dev build-base libssh2-dev"
ENV APK_DEL="python build-base"

RUN apk add --no-cache ${APK_ADD}

EXPOSE 3009

COPY ./ ./

# Install and remove .npmrc in case it was injected at build time
RUN BUILD_ONLY=true npm ci && rm -f .npmrc 

# uninstall the deps only needed by npm install
RUN apk del ${APK_DEL}

# Set environment to production
ENV NODE_ENV=production

RUN npm run build

CMD npm run start:prod