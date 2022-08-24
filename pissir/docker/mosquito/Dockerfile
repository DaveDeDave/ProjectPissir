FROM alpine:latest
WORKDIR /app
RUN apk add nodejs npm
RUN npm install -g yarn
COPY package.json .
COPY yarn.lock .
COPY yarnrc.yml .
COPY .yarn ./.yarn/
COPY packages/mosquito/package.json ./packages/mosquito/package.json
COPY packages/lib/package.json ./packages/lib/package.json
RUN yarn
COPY packages/mosquito/ ./packages/mosquito/
COPY packages/lib/ ./packages/lib/
CMD yarn workspace @pissir/mosquito prod