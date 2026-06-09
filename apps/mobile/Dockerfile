# Build context: repository root.
FROM node:20-bookworm-slim AS build

WORKDIR /app

ENV CI=1
ARG APP_ENV=production
ARG EXPO_PUBLIC_APP_ENV=production
ARG EXPO_PUBLIC_API_PROTOCOL=http
ARG EXPO_PUBLIC_API_HOST=122.51.31.139
ARG EXPO_PUBLIC_API_PORT=
ARG EXPO_PUBLIC_API_BASE_PATH=
ARG EXPO_PUBLIC_API_BASE_URL=
ARG EXPO_PUBLIC_AUTH_BASE_PATH=/api/v1/auth
ARG EXPO_PUBLIC_FINANCE_BASE_PATH=/api/v1/finance

ENV APP_ENV=${APP_ENV}
ENV EXPO_PUBLIC_APP_ENV=${EXPO_PUBLIC_APP_ENV}
ENV EXPO_PUBLIC_API_PROTOCOL=${EXPO_PUBLIC_API_PROTOCOL}
ENV EXPO_PUBLIC_API_HOST=${EXPO_PUBLIC_API_HOST}
ENV EXPO_PUBLIC_API_PORT=${EXPO_PUBLIC_API_PORT}
ENV EXPO_PUBLIC_API_BASE_PATH=${EXPO_PUBLIC_API_BASE_PATH}
ENV EXPO_PUBLIC_API_BASE_URL=${EXPO_PUBLIC_API_BASE_URL}
ENV EXPO_PUBLIC_AUTH_BASE_PATH=${EXPO_PUBLIC_AUTH_BASE_PATH}
ENV EXPO_PUBLIC_FINANCE_BASE_PATH=${EXPO_PUBLIC_FINANCE_BASE_PATH}

COPY package.json package-lock.json ./
COPY scripts ./scripts
COPY apps/mobile/package.json ./apps/mobile/package.json
RUN npm ci

COPY apps/mobile ./apps/mobile
WORKDIR /app/apps/mobile
RUN npx expo export --platform web --output-dir dist

FROM nginx:1.27-alpine AS runtime

COPY apps/mobile/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/mobile/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
