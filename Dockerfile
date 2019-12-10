FROM node:10-alpine

EXPOSE 3009

COPY ./ ./

# Remove .npmrc in case it was injected at build time
RUN rm -f .npmrc 


# Set environment to production
ENV NODE_ENV=production

CMD npm run start:prod