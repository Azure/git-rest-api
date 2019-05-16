FROM node:10

EXPOSE 3009

COPY ./ ./

RUN npm ci
RUN npm run build

CMD npm run start:prod