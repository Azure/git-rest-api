FROM node:10

EXPOSE 3009

COPY ./ ./

RUN npm ci

# Remove .npmrc in case it was injected at build time
RUN rm -f .npmrc

RUN npm run build

CMD npm run start:prod