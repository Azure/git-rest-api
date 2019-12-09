FROM node:12-alpine

EXPOSE 3009

COPY ./ ./

# Install and remove .npmrc in case it was injected at build time
RUN npm ci && \
    rm -f .npmrc 


# Set environment to production
ENV NODE_ENV=production

RUN npm run build

CMD npm run start:prod