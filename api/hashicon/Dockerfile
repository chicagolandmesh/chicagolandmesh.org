FROM node:18-alpine AS build

WORKDIR /usr/src/app

RUN apk add --no-cache \
    build-base \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev

COPY package*.json .
RUN npm ci --omit=dev

COPY server.js .


FROM node:18-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache \
    cairo \
    pango \
    jpeg \
    giflib \
    librsvg

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/server.js .

EXPOSE 3000
CMD ["node", "server.js"]
