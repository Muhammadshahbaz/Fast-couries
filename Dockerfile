FROM node:22-alpine AS assets

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY resources ./resources
COPY public ./public
COPY vite.config.js postcss.config.js tailwind.config.js ./
RUN npm run build

FROM composer:2 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-scripts

FROM php:8.3-cli-alpine

WORKDIR /var/www/html

RUN apk add --no-cache bash icu-dev libzip-dev postgresql-dev sqlite-dev \
    && docker-php-ext-install intl pdo pdo_pgsql pdo_sqlite zip

COPY --from=vendor /app/vendor ./vendor
COPY --from=assets /app/public/build ./public/build
COPY . .
COPY docker/entrypoint.sh /usr/local/bin/fast-couriers-entrypoint

RUN chmod +x /usr/local/bin/fast-couriers-entrypoint \
    && mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 8000

ENTRYPOINT ["fast-couriers-entrypoint"]
