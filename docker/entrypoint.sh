#!/usr/bin/env bash
set -e

PORT="${PORT:-8000}"

if [ -n "${APP_KEY:-}" ]; then
    php artisan config:cache
fi

php artisan route:cache || true
php artisan view:cache || true

php artisan migrate --force

php artisan db:seed --force

exec php artisan serve --host=0.0.0.0 --port="${PORT}"
