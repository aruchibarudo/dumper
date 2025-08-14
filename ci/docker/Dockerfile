ARG REGISTRY=registry.red-soft.ru
ARG IMAGE=/ubi8/nodejs-20:latest

FROM ${REGISTRY}${IMAGE}

ARG API_BASE_URL

ENV NEXT_PUBLIC_API_BASE_URL=${API_BASE_URL}

WORKDIR /opt/app
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY . ./
COPY .env.example .env.production
RUN npm run build

CMD ["npm", "start"]