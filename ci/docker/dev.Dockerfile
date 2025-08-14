FROM quay-registry.repos.devzone.local/dev_zone/ubi8/nodejs-18:latest as build

WORKDIR /src/build-your-own-radar
COPY package.json ./
COPY package-lock.json ./

RUN npm ci

COPY . ./

ARG API_BASE_URL
ARG MIN_RU_RADARS
ARG API_AUTH_TOKEN

ENV API_BASE_URL=${API_BASE_URL}
ENV MIN_RU_RADARS=${MIN_RU_RADARS}
ENV API_AUTH_TOKEN=${API_AUTH_TOKEN}

RUN npm run build:prod
# Override parent node image's entrypoint script (/usr/local/bin/docker-entrypoint.sh),
# which tries to run CMD as a node command

#RUN ./build_and_start_nginx.sh

FROM quay-registry.repos.devzone.local/dev_zone/ubi8/nginx-122:latest as runtime

WORKDIR /opt/build-your-own-radar

COPY --from=build /src/build-your-own-radar/dist/ ./

RUN mkdir -p /opt/app-root/etc/nginx.default.d/

COPY radar.conf /opt/app-root/etc/nginx.default.d/

CMD ["nginx", "-g", "daemon off;error_log /dev/stdout info;"]