<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="description" content="{{ config('company.name') }} is a courier aggregation and seller operations platform for ecommerce businesses in Pakistan: booking, tracking, COD payouts, returns, and courier API readiness.">
        <meta property="og:site_name" content="{{ config('company.name') }}">
        <meta property="og:type" content="website">
        <meta property="og:title" content="{{ config('company.name') }} | Courier Aggregation for Ecommerce">
        <meta property="og:description" content="Compare couriers, book shipments, track buyers, prove returns, and manage COD payouts from one seller operations platform.">
        <meta property="og:image" content="{{ url('/og-fast-couriers.svg') }}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ config('company.name') }} | Courier Aggregation for Ecommerce">
        <meta name="twitter:description" content="Courier comparison, booking, tracking, return proof, COD payout invoices, and admin courier API readiness.">
        <meta name="twitter:image" content="{{ url('/og-fast-couriers.svg') }}">

        <title inertia>{{ config('company.name', config('app.name', 'Laravel')) }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
