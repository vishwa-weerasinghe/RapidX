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

# Promote client to admin
php artisan tinker --execute="App\Models\User::where('Email', 'minneriyawildjeepsafari@gmail.com')->update(['role' => 'admin']);"

# (Recommended) Remove the insecure default demo admin if it exists
php artisan tinker --execute="App\Models\User::where('Email', 'admin@rapidx.com')->delete();"