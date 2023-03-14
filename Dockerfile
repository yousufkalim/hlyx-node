FROM node:18.12.1-alpine3.15 AS build

WORKDIR /app

COPY package*.json yarn.lock ./

RUN yarn
RUN yarn install --only=dev

COPY . .

RUN yarn prisma generate

COPY prisma ./prisma/

RUN yarn run build

FROM node:18.12.1-alpine3.15 AS production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist

EXPOSE 4000

CMD ["yarn", "run", "start:prod"]