#!/usr/bin/env bash
set -e

# Wait for DB
echo "→ Waiting for MySQL at ${DB_HOST}:${DB_PORT}…"
for i in {1..60}; do
  if mysqladmin ping -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USERNAME}" -p"${DB_PASSWORD}" --silent; then
    echo "✓ MySQL is up"; break
  fi
  sleep 1
done

# Cache config + routes + views for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations on boot (idempotent)
if [ "${RUN_MIGRATIONS_ON_BOOT:-true}" = "true" ]; then
  php artisan migrate --force
fi

# Optimize autoloader
php artisan optimize

exec "$@"
