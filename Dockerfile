FROM node:10

EXPOSE 3009

COPY ./ ./

CMD npm run start:prod