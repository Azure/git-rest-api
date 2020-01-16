FROM alpine:3.11

ENV APK_ADD="nodejs-npm python krb5-dev curl-dev build-base libssh2-dev"
ENV APK_DEL="python build-base"

EXPOSE 3009

COPY ./ ./

RUN apk update && \
    apk upgrade && \
    apk add --no-cache ${APK_ADD} && \
    BUILD_ONLY=true npm ci && \
    rm -f .npmrc && \
    apk del ${APK_DEL}

# Set environment to production
ENV NODE_ENV=production

RUN npm run build

CMD npm run start:prod