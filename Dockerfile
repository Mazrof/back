## First Stage
FROM node:lts-alpine3.20 as build

WORKDIR /build

COPY package*.json ./

RUN ["npm","install"]

COPY ./ ./

RUN ["npx","prisma","generate"]

RUN ["npm","run","build"]


## Second Stage
FROM node:lts-alpine3.20 as production

WORKDIR /prod

## arg variables

ARG FIREBASE_APIKEY_ARG=
ARG FIRBASE_AUTHDOMAIN_ARG=
ARG FIREBASE_PROJECT_ID_ARG=
ARG FIREBASE_STORAGE_BUCKET_ARG=
ARG FIREBASE_MESSAGING_SENDER_ID_ARG=
ARG FIREBASE_APP_ID_ARG=
ARG FIREBASE_MEASUREMENT_ID_ARG=
ARG NODE_ENV_ARG="development"
ARG DATABASE_URL_ARG

## env variables
ENV FIREBASE_APIKEY=${FIREBASE_APIKEY_ARG}
ENV FIRBASE_AUTHDOMAIN=${FIRBASE_AUTHDOMAIN_ARG}
ENV FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID_ARG}
ENV FIREBASE_STORAGE_BUCKET=${FIREBASE_STORAGE_BUCKET_ARG}
ENV FIREBASE_MESSAGING_SENDER_ID=${FIREBASE_MESSAGING_SENDER_ID_ARG}
ENV FIREBASE_APP_ID=${FIREBASE_APP_ID_ARG}
ENV FIREBASE_MEASUREMENT_ID=${FIREBASE_MEASUREMENT_ID_ARG}
ENV NODE_ENV=${NODE_ENV_ARG}
ENV DATABASE_URL=${DATABASE_URL_ARG}
## Copying

COPY --from=build /build/build ./build

COPY --from=build /build/node_modules ./node_modules

COPY --from=build /build/package*.json ./

COPY --from=build /build/prisma ./prisma

EXPOSE 3000

CMD ["npm","run","container"]