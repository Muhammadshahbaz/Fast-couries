# Fast Couriers

Courier aggregator platform for Pakistan ecommerce sellers, built with Laravel 11, React, Inertia, Tailwind CSS, SQLite/MySQL-ready migrations, queues, and Redis-ready configuration.

## What Is Implemented

- Laravel 11 + React/Tailwind/Inertia foundation with Breeze auth.
- Seller onboarding fields for phone, CNIC, business, city, bank, wallet, and terms acceptance.
- Role-ready users for sellers, admins, sub-admins, and account managers.
- Courier platform schema for cities, couriers, city rates, shipments, tracking events, and seller profiles.
- Seeded demo data for TCS, Leopards, M&P, BlueEx, Call Courier, Pakistan cities, sample shipments, and tracking history.
- Provider-ready courier API layer for TCS, FedEx, Leopards, M&P, BlueEx, and Call Courier with sandbox adapters.
- Seller dashboard with booking KPIs, COD numbers, delivery/return charts, top cities, courier recommendations, and recent bookings.
- New booking flow where sellers compare courier charges by city and weight slabs before selecting a courier.
- Competitor-informed landing page focused on same-day COD, smart courier selection, returns proof, and seller operations.
- Competitive product blueprint in `docs/competitive-blueprint.md`.
- Rate card baseline in `docs/rate-card.md`.

## Demo Accounts

- Seller: `seller@example.com` / `password`
- Admin: `admin@example.com` / `password`

## Local Setup

```bash
composer install --no-security-blocking
npm install
php artisan migrate:fresh --seed
npm run build
php artisan serve --host=127.0.0.1 --port=8000
```

Open `http://127.0.0.1:8000`.

## Verification

```bash
npm run build
php artisan test
```

Laravel 11 currently emits a PHP 8.5 vendor deprecation around `PDO::MYSQL_ATTR_SSL_CA` under PHPUnit. The test suite passes; the app entrypoints suppress deprecated output so browser responses are clean.

## Courier API Integrations

All couriers resolve through one internal gateway contract:

- `app/Couriers/Contracts/CourierGateway.php`
- `app/Couriers/CourierManager.php`
- `app/Couriers/CourierBookingService.php`
- `app/Couriers/CourierTrackingService.php`

Credentials live in `.env` and provider mapping lives in `config/couriers.php`. Current gateways run in sandbox mode and return deterministic AWB/tracking data until real courier credentials and endpoint payloads are added.
