FROM alpine:latest as fe-builder
WORKDIR /app
RUN apk add nodejs npm
RUN npm install -g yarn
COPY package.json .
COPY yarn.lock .
COPY yarnrc.yml .
COPY .yarn ./.yarn/
COPY packages/fe/package.json ./packages/fe/package.json
RUN yarn
COPY packages/fe/ ./packages/fe/
#RUN yarn workspaces focus @pissir/fe
RUN yarn workspace @pissir/fe build

FROM alpine:latest as cert-builder
WORKDIR /app
RUN apk add openssl
RUN openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:4096 -keyout ca.key -out ca.crt -subj "/C=IT/ST=Italy/L=Rome/O=Org/OU=Org/CN=pissir.local"

FROM nginx:alpine
WORKDIR /app
COPY --from=fe-builder /app/packages/fe/dist ./dist/
COPY --from=cert-builder /app/ca.crt .
COPY --from=cert-builder /app/ca.key .