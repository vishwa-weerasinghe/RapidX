#!/usr/bin/env bash
# exit on error
set -o errexit

# Install composer dependencies
composer install --optimize-autoloader --no-dev

# Clear and cache configurations
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run database migrations
# php artisan migrate --force