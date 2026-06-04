# syntax=docker/dockerfile:1.6
# Production Dockerfile for the Laravel API + Reverb + queue worker.
# Build:  docker build -t panda-app -f backend-laravel/Dockerfile backend-laravel
# Run:    docker compose up

FROM php:8.2-fpm-alpine AS base

# System deps
RUN apk add --no-cache \
        bash git curl unzip libzip-dev libpng-dev oniguruma-dev icu-dev \
        mysql-client redis tini supervisor nginx \
    && docker-php-ext-install \
        pdo_mysql mbstring zip exif pcntl bcmath gd intl opcache sockets

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Install dependencies first (cached layer)
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --no-scripts --no-autoloader

# Copy app
COPY . .
RUN composer dump-autoload --optimize \
    && php artisan storage:link || true

# Permissions
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Production tuning
COPY deploy/docker/php.ini    /usr/local/etc/php/conf.d/zz-panda.ini
COPY deploy/docker/nginx.conf /etc/nginx/nginx.conf
COPY deploy/docker/supervisord.conf /etc/supervisord.conf
COPY deploy/docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80 8080

ENTRYPOINT ["/sbin/tini", "--", "/usr/local/bin/entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
