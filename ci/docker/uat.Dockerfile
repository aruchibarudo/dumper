ARG REGISTRY=redsoft-registry.gazprom-neft.local:5000
ARG IMAGE=/ubi8/nodejs-20:latest

FROM ${REGISTRY}${IMAGE}


USER root

RUN curl -k https://nexus.gazprom-neft.local/repository/local-repo/CA/root-ca-gazprom-neft.pem -o /etc/pki/ca-trust/source/anchors/root-ca-gazprom-neft.crt && \
  curl -k https://nexus.gazprom-neft.local/repository/local-repo/CA/sub-ca.pem -o /etc/pki/ca-trust/source/anchors/sub-ca.crt && \
  /bin/update-ca-trust

USER default

ARG NPM_REGISTRY=https://nexus.gazprom-neft.local/repository/npm-nodejs-external-dso/
ARG API_BASE_URL

ENV NEXT_PUBLIC_API_BASE_URL=${API_BASE_URL}

WORKDIR /opt/app
COPY package.json ./
COPY package-lock.json ./
RUN npm config set strict-ssl=false && \
  npm config set registry=${NPM_REGISTRY} && \
  npm ci
#RUN find /opt/app-root/src/.npm/_logs -name "*.log" -exec tail -50 {} \;
COPY . ./
RUN npm run build

CMD ["npm", "start"]