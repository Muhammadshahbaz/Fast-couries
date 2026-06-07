<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\BookingListController;
use App\Http\Controllers\PublicTrackingController;
use App\Http\Controllers\PayoutController;
use App\Http\Controllers\ReturnController;
use App\Http\Controllers\SupportTicketController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminCourierController;
use App\Http\Controllers\AdminPayoutController;
use App\Http\Controllers\AdminSellerController;
use App\Http\Controllers\AdminShipmentController;
use App\Http\Controllers\ActionCenterController;
use App\Http\Controllers\AiCommandCenterController;
use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\CourierWebhookController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\GrowthSuiteController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ManifestController;
use App\Http\Controllers\MarketingPageController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ShipmentController;
use App\Http\Controllers\TeamController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/courier-labels/sandbox/{awb}', function (string $awb) {
    return response("Sandbox shipping label for {$awb}", 200, [
        'Content-Type' => 'text/plain',
    ]);
})->name('couriers.labels.sandbox');

Route::get('/courier-proof/sandbox/{awb}/call-recording', function (string $awb) {
    return response("Sandbox call recording transcript for {$awb}: rider called buyer twice, buyer refused delivery and confirmed return.", 200, [
        'Content-Type' => 'text/plain',
    ]);
})->name('couriers.proof.call-recording.sandbox');

Route::get('/courier-proof/sandbox/{awb}/attempt-photo', function (string $awb) {
    return response("Sandbox delivery attempt photo record for {$awb}: rider reached receiver address and captured location proof.", 200, [
        'Content-Type' => 'text/plain',
    ]);
})->name('couriers.proof.attempt-photo.sandbox');

Route::get('/track', [PublicTrackingController::class, 'show'])->name('track');
Route::post('/chatbot/message', ChatbotController::class)->name('chatbot.message');
Route::post('/webhooks/couriers/{code}', CourierWebhookController::class)->name('webhooks.couriers');
Route::get('/about', [MarketingPageController::class, 'about'])->name('about');
Route::get('/services', [MarketingPageController::class, 'services'])->name('services');
Route::get('/pricing', [MarketingPageController::class, 'pricing'])->name('pricing');
Route::get('/integrations', [MarketingPageController::class, 'integrations'])->name('integrations');
Route::get('/advance-cod', [MarketingPageController::class, 'advanceCod'])->name('advance-cod');
Route::get('/cod-policy', [MarketingPageController::class, 'codPolicy'])->name('cod-policy');
Route::get('/deployment-checklist', [MarketingPageController::class, 'deploymentChecklist'])->name('deployment-checklist');
Route::get('/operations-sop', [MarketingPageController::class, 'operationsSop'])->name('operations-sop');
Route::get('/claims', [MarketingPageController::class, 'claims'])->name('claims');
Route::get('/bulk-shipping', [MarketingPageController::class, 'bulkShipping'])->name('bulk-shipping');
Route::get('/faq', [MarketingPageController::class, 'faq'])->name('faq');
Route::get('/contact', [MarketingPageController::class, 'contact'])->name('contact');
Route::post('/contact', [MarketingPageController::class, 'submitContact'])->name('contact.submit');
Route::get('/privacy', [MarketingPageController::class, 'privacy'])->name('privacy');
Route::get('/terms', [MarketingPageController::class, 'terms'])->name('terms');

Route::get('/dashboard', DashboardController::class)->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/ai-command-center', AiCommandCenterController::class)->name('ai.index');
    Route::get('/growth-suite', GrowthSuiteController::class)->name('growth-suite.index');
    Route::get('/action-center', [ActionCenterController::class, 'index'])->name('action-center.index');
    Route::post('/action-center/pickups', [ActionCenterController::class, 'pickup'])->name('action-center.pickups.store');
    Route::post('/action-center/returns/{shipment}/recover-stock', [ActionCenterController::class, 'recoverReturnStock'])->name('action-center.returns.recover-stock');
    Route::post('/action-center/notifications/{shipment}', [ActionCenterController::class, 'notifyBuyer'])->name('action-center.notifications.store');
    Route::post('/action-center/claims', [ActionCenterController::class, 'claim'])->name('action-center.claims.store');
    Route::get('/bookings', BookingListController::class)->name('bookings.index');
    Route::get('/bookings/create', [BookingController::class, 'create'])->name('bookings.create');
    Route::post('/bookings', [BookingController::class, 'store'])->name('bookings.store');
    Route::get('/shipments/{shipment}', [ShipmentController::class, 'show'])->name('shipments.show');
    Route::post('/shipments/{shipment}/sync', [ShipmentController::class, 'sync'])->name('shipments.sync');
    Route::post('/shipments/{shipment}/cancel', [ShipmentController::class, 'cancel'])->name('shipments.cancel');
    Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');
    Route::post('/inventory', [InventoryController::class, 'store'])->name('inventory.store');
    Route::patch('/inventory/{product}', [InventoryController::class, 'update'])->name('inventory.update');
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
    Route::post('/orders/import', [OrderController::class, 'import'])->name('orders.import');
    Route::get('/orders/import/template', [OrderController::class, 'template'])->name('orders.import.template');
    Route::patch('/orders/{order}', [OrderController::class, 'update'])->name('orders.update');
    Route::post('/orders/{order}/shipment', [OrderController::class, 'createShipment'])->name('orders.shipment.store');
    Route::post('/orders/batch-shipment', [OrderController::class, 'batchShipment'])->name('orders.batch-shipment.store');
    Route::get('/manifests/{manifest}', [ManifestController::class, 'show'])->name('manifests.show');
    Route::get('/payouts', PayoutController::class)->name('payouts.index');
    Route::post('/payouts/invoices', [PayoutController::class, 'store'])->name('payouts.invoices.store');
    Route::get('/returns', ReturnController::class)->name('returns.index');
    Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::post('/customers', [CustomerController::class, 'store'])->name('customers.store');
    Route::get('/team', [TeamController::class, 'index'])->name('team.index');
    Route::post('/team', [TeamController::class, 'store'])->name('team.store');
    Route::get('/support', [SupportTicketController::class, 'index'])->name('support.index');
    Route::post('/support', [SupportTicketController::class, 'store'])->name('support.store');
    Route::get('/reports', [ReportController::class, 'seller'])->name('reports.seller');
    Route::get('/admin', AdminDashboardController::class)->name('admin.dashboard');
    Route::get('/admin/couriers', [AdminCourierController::class, 'index'])->name('admin.couriers.index');
    Route::patch('/admin/couriers/{courier}', [AdminCourierController::class, 'updateCourier'])->name('admin.couriers.update');
    Route::post('/admin/couriers/{courier}/health-check', [AdminCourierController::class, 'healthCheck'])->name('admin.couriers.health-check');
    Route::patch('/admin/rates/{rate}', [AdminCourierController::class, 'updateRate'])->name('admin.rates.update');
    Route::get('/admin/rates/export', [AdminCourierController::class, 'exportRates'])->name('admin.rates.export');
    Route::post('/admin/rates/import', [AdminCourierController::class, 'importRates'])->name('admin.rates.import');
    Route::get('/admin/payouts', [AdminPayoutController::class, 'index'])->name('admin.payouts.index');
    Route::post('/admin/payouts/{invoice}/bank-ready', [AdminPayoutController::class, 'markBankReady'])->name('admin.payouts.bank-ready');
    Route::post('/admin/payouts/{invoice}/bank-processing', [AdminPayoutController::class, 'markProcessing'])->name('admin.payouts.bank-processing');
    Route::post('/admin/payouts/{invoice}/bank-failed', [AdminPayoutController::class, 'markFailed'])->name('admin.payouts.bank-failed');
    Route::get('/admin/payouts/bank-file/export', [AdminPayoutController::class, 'exportBankFile'])->name('admin.payouts.bank-file.export');
    Route::post('/admin/payouts/{invoice}/paid', [AdminPayoutController::class, 'markPaid'])->name('admin.payouts.mark-paid');
    Route::get('/admin/shipments', [AdminShipmentController::class, 'index'])->name('admin.shipments.index');
    Route::post('/admin/shipments/{shipment}/sync', [AdminShipmentController::class, 'sync'])->name('admin.shipments.sync');
    Route::patch('/admin/shipments/{shipment}/status', [AdminShipmentController::class, 'updateStatus'])->name('admin.shipments.status');
    Route::get('/admin/sellers', [AdminSellerController::class, 'index'])->name('admin.sellers.index');
    Route::patch('/admin/sellers/{seller}', [AdminSellerController::class, 'update'])->name('admin.sellers.update');
    Route::get('/admin/reports', [ReportController::class, 'admin'])->name('reports.admin');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
