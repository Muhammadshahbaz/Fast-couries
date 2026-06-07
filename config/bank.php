<?php

return [
    'mode' => env('BANK_TRANSFER_MODE', 'manual'),
    'provider' => env('BANK_TRANSFER_PROVIDER', 'undecided'),
    'export_format' => env('BANK_EXPORT_FORMAT', 'generic_csv'),
];
