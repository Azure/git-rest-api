FROM node:10

EXPOSE 3009

COPY ./ ./

# Install and remove .npmrc in case it was injected at build time
RUN npm ci && \
    rm -f .npmrc 

RUN npm run build

CMD npm run start:prod