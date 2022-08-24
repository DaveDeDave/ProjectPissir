FROM alpine:latest as cert-builder
WORKDIR /app
RUN apk add openssl openssh-keygen
RUN ssh-keygen -t rsa -b 4096 -m PEM -f RS256.key -P ""  && openssl rsa -in RS256.key -pubout -outform PEM -out RS256.pub

FROM alpine:latest
WORKDIR /app
RUN apk add nodejs npm
RUN npm install -g yarn
COPY package.json .
COPY yarn.lock .
COPY yarnrc.yml .
COPY .yarn ./.yarn/
COPY packages/auth/package.json ./packages/auth/package.json
COPY packages/lib/package.json ./packages/lib/package.json
COPY --from=cert-builder /app/RS256.key /app/auth-data/RS256.key
COPY --from=cert-builder /app/RS256.pub /app/auth-data/RS256.pub
RUN yarn
COPY packages/auth/ ./packages/auth/
COPY packages/lib/ ./packages/lib/
#RUN yarn workspaces focus --production @pissir/be
CMD yarn workspace @pissir/auth prod