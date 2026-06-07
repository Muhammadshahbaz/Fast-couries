<?php

namespace Tests\Feature;

use App\Models\Courier;
use App\Models\CourierRate;
use App\Models\ContactMessage;
use App\Models\PayoutInvoice;
use App\Models\InventoryProduct;
use App\Models\Order;
use App\Models\ShippingManifest;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ProductSurfaceTest extends TestCase
{
    use RefreshDatabase;

    public function test_seller_product_pages_render(): void
    {
        $this->seed();
        $seller = User::where('email', 'seller@example.com')->firstOrFail();

        $this->actingAs($seller)->get(route('payouts.index'))->assertOk()->assertInertia(fn ($page) => $page->component('Payouts/Index'));
        $this->actingAs($seller)->get(route('returns.index'))->assertOk()->assertInertia(fn ($page) => $page->component('Returns/Index'));
        $this->actingAs($seller)->get(route('support.index'))->assertOk()->assertInertia(fn ($page) => $page->component('Support/Index'));
        $this->actingAs($seller)->get(route('inventory.index'))->assertOk()->assertInertia(fn ($page) => $page->component('Inventory/Index'));
        $this->actingAs($seller)->get(route('orders.index'))->assertOk()->assertInertia(fn ($page) => $page->component('Orders/Index'));
        $this->actingAs($seller)->get(route('action-center.index'))->assertOk()->assertInertia(fn ($page) => $page->component('ActionCenter/Index'));
        $this->actingAs($seller)->get(route('customers.index'))->assertOk()->assertInertia(fn ($page) => $page->component('Customers/Index'));
        $this->actingAs($seller)->get(route('team.index'))->assertOk()->assertInertia(fn ($page) => $page->component('Team/Index'));
        $this->actingAs($seller)->get(route('ai.index'))->assertOk()->assertInertia(fn ($page) => $page->component('Ai/CommandCenter'));
        $this->actingAs($seller)->get(route('growth-suite.index'))->assertOk()->assertInertia(fn ($page) => $page->component('GrowthSuite/Index'));
    }

    public function test_seller_can_manage_inventory_products(): void
    {
        $this->seed();
        $seller = User::where('email', 'seller@example.com')->firstOrFail();

        $this->actingAs($seller)->post(route('inventory.store'), [
            'name' => 'Denim Jacket',
            'sku' => 'DENIM-JKT-M',
            'description' => 'Medium denim jacket',
            'weight_grams' => 1200,
            'stock_on_hand' => 12,
            'low_stock_alert' => 3,
            'is_active' => true,
        ])->assertRedirect();

        $product = InventoryProduct::where('sku', 'DENIM-JKT-M')->firstOrFail();

        $this->assertSame($seller->id, $product->seller_id);
        $this->assertSame(12, $product->stock_on_hand);

        $this->actingAs($seller)->patch(route('inventory.update', $product), [
            'name' => 'Denim Jacket',
            'sku' => 'DENIM-JKT-M',
            'description' => 'Medium denim jacket',
            'weight_grams' => 1150,
            'stock_on_hand' => 2,
            'low_stock_alert' => 4,
            'is_active' => true,
        ])->assertRedirect();

        $product->refresh();

        $this->assertSame(1150, $product->weight_grams);
        $this->assertSame(2, $product->stock_on_hand);
        $this->assertTrue($product->isLowStock());
    }

    public function test_seller_can_create_order_and_convert_it_to_shipment(): void
    {
        $this->seed();
        $seller = User::where('email', 'seller@example.com')->firstOrFail();
        $product = InventoryProduct::whereBelongsTo($seller, 'seller')->where('stock_on_hand', '>', 5)->firstOrFail();
        $city = \App\Models\City::where('name', 'Karachi')->firstOrFail();
        $startingStock = $product->stock_on_hand;

        $this->actingAs($seller)->post(route('orders.store'), [
            'inventory_product_id' => $product->id,
            'city_id' => $city->id,
            'customer_name' => 'Order Customer',
            'customer_phone' => '03001112222',
            'customer_address' => 'House 2, Main Road',
            'customer_area' => 'Gulshan',
            'quantity' => 2,
            'cod_amount_paisa' => 350000,
            'notes' => 'Pack carefully',
        ])->assertRedirect();

        $order = Order::where('customer_name', 'Order Customer')->firstOrFail();

        $this->assertNotNull($order->address_score);
        $this->assertSame('strong', $order->address_verification_level);

        $this->actingAs($seller)
            ->post(route('orders.shipment.store', $order))
            ->assertRedirect();

        $order->refresh();

        $this->assertSame('shipped', $order->status);
        $this->assertNotNull($order->shipment_id);
        $this->assertSame($product->id, $order->shipment->inventory_product_id);
        $this->assertSame(2, $order->shipment->product_quantity);
        $this->assertSame($order->address_score, $order->shipment->address_score);
        $this->assertSame($order->address_verification_level, $order->shipment->address_verification_level);
        $this->assertSame($startingStock - 2, $product->refresh()->stock_on_hand);
    }

    public function test_seller_can_batch_ship_orders_and_view_manifest(): void
    {
        $this->seed();
        $seller = User::where('email', 'seller@example.com')->firstOrFail();
        $orders = Order::whereBelongsTo($seller, 'seller')
            ->whereIn('status', ['pending', 'packed'])
            ->whereNull('shipment_id')
            ->limit(2)
            ->get();

        $this->assertCount(2, $orders);

        $this->actingAs($seller)
            ->post(route('orders.batch-shipment.store'), [
                'order_ids' => $orders->pluck('id')->all(),
            ])
            ->assertRedirect();

        $manifest = ShippingManifest::whereBelongsTo($seller, 'seller')->firstOrFail();

        $this->assertSame(2, $manifest->total_shipments);
        $this->assertCount(2, $manifest->shipment_ids);
        $this->assertSame('shipped', $orders[0]->refresh()->status);
        $this->assertNotNull($orders[0]->shipment_id);

        $this->actingAs($seller)
            ->get(route('manifests.show', $manifest))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Manifests/Show')
                ->where('manifest.manifestNumber', $manifest->manifest_number)
                ->has('shipments', 2)
            );
    }

    public function test_seller_can_use_action_center_customer_and_team_tools(): void
    {
        $this->seed();
        $seller = User::where('email', 'seller@example.com')->firstOrFail();
        $city = \App\Models\City::where('name', 'Karachi')->firstOrFail();
        $shipment = Shipment::query()
            ->whereBelongsTo($seller, 'seller')
            ->whereNotNull('inventory_product_id')
            ->where('status', 'booked')
            ->firstOrFail();
        $product = $shipment->inventoryProduct()->firstOrFail();

        $shipment->forceFill([
            'status' => 'returned',
            'returned_at' => now(),
            'product_quantity' => 2,
            'return_stock_recovered_at' => null,
        ])->save();

        $manifest = ShippingManifest::create([
            'seller_id' => $seller->id,
            'manifest_number' => 'MAN-TEST-001',
            'shipment_ids' => [$shipment->id],
            'total_shipments' => 1,
            'total_cod_paisa' => $shipment->cod_amount_paisa,
            'status' => 'ready',
        ]);

        $this->actingAs($seller)->post(route('action-center.pickups.store'), [
            'shipping_manifest_id' => $manifest->id,
            'pickup_address' => 'Warehouse 10, Karachi',
            'pickup_date' => now()->addDay()->toDateString(),
            'time_window' => '12:00-18:00',
            'notes' => 'Call dispatch manager.',
        ])->assertRedirect();

        $this->assertDatabaseHas('pickup_requests', [
            'seller_id' => $seller->id,
            'shipping_manifest_id' => $manifest->id,
            'status' => 'requested',
        ]);

        $this->actingAs($seller)->post(route('action-center.notifications.store', $shipment), [
            'event_type' => 'returned',
        ])->assertRedirect();

        $this->assertDatabaseHas('notification_events', [
            'seller_id' => $seller->id,
            'shipment_id' => $shipment->id,
            'event_type' => 'returned',
            'status' => 'queued',
        ]);

        $this->actingAs($seller)->post(route('action-center.claims.store'), [
            'shipment_id' => $shipment->id,
            'subject' => 'Returned parcel damage claim',
            'message' => 'Please investigate the returned parcel condition.',
        ])->assertRedirect();

        $this->assertDatabaseHas('support_tickets', [
            'seller_id' => $seller->id,
            'shipment_id' => $shipment->id,
            'category' => 'claim',
            'priority' => 'urgent',
        ]);

        $startingStock = $product->refresh()->stock_on_hand;

        $this->actingAs($seller)->post(route('action-center.returns.recover-stock', $shipment))->assertRedirect();

        $this->assertSame($startingStock + 2, $product->refresh()->stock_on_hand);
        $this->assertNotNull($shipment->refresh()->return_stock_recovered_at);

        $this->actingAs($seller)->post(route('customers.store'), [
            'name' => 'Repeat Buyer',
            'phone' => '03009991111',
            'city_id' => $city->id,
            'area' => 'DHA',
            'address' => 'House 77, Street 4',
        ])->assertRedirect();

        $this->assertDatabaseHas('customer_addresses', [
            'seller_id' => $seller->id,
            'phone' => '03009991111',
            'city_id' => $city->id,
        ]);

        $this->actingAs($seller)->post(route('team.store'), [
            'name' => 'Warehouse Packer',
            'email' => 'packer@example.com',
            'role' => 'packer',
        ])->assertRedirect();

        $this->assertDatabaseHas('team_members', [
            'seller_id' => $seller->id,
            'email' => 'packer@example.com',
            'role' => 'packer',
            'is_active' => true,
        ]);
    }

    public function test_seller_can_bulk_import_orders_from_csv(): void
    {
        $this->seed();
        $seller = User::where('email', 'seller@example.com')->firstOrFail();
        $product = InventoryProduct::whereBelongsTo($seller, 'seller')->where('stock_on_hand', '>', 5)->firstOrFail();

        $csv = implode("\n", [
            'customer_name,customer_phone,customer_address,city,sku,quantity,cod_amount,notes',
            "Bulk Customer,03005556666,\"House 1, Main Road\",Karachi,{$product->sku},2,1999,Imported order",
            "Bad Customer,03005556667,\"House 2, Main Road\",Unknown City,{$product->sku},1,999,Invalid city",
        ]);

        $file = UploadedFile::fake()->createWithContent('orders.csv', $csv);

        $this->actingAs($seller)
            ->post(route('orders.import'), ['orders_csv' => $file])
            ->assertRedirect()
            ->assertSessionHas('importResult.created', 1)
            ->assertSessionHas('importResult.skipped', 1);

        $this->assertDatabaseHas('orders', [
            'seller_id' => $seller->id,
            'customer_name' => 'Bulk Customer',
            'quantity' => 2,
            'cod_amount_paisa' => 199900,
        ]);
        $this->assertNotNull(Order::where('customer_name', 'Bulk Customer')->firstOrFail()->address_score);
        $this->assertDatabaseMissing('orders', [
            'customer_name' => 'Bad Customer',
        ]);
    }

    public function test_order_import_template_downloads(): void
    {
        $this->seed();
        $seller = User::where('email', 'seller@example.com')->firstOrFail();

        $this->actingAs($seller)
            ->get(route('orders.import.template'))
            ->assertOk()
            ->assertHeader('Content-Type', 'text/csv; charset=utf-8')
            ->assertSee('"customer_name","customer_phone","customer_address","city","sku","quantity","cod_amount","notes"', false);
    }

    public function test_admin_operations_page_requires_admin_and_renders(): void
    {
        $this->seed();
        $seller = User::where('email', 'seller@example.com')->firstOrFail();
        $admin = User::where('email', 'admin@example.com')->firstOrFail();

        $this->actingAs($seller)->get(route('admin.dashboard'))->assertForbidden();
        $this->actingAs($admin)->get(route('admin.dashboard'))->assertOk()->assertInertia(fn ($page) => $page
            ->component('Admin/Dashboard')
            ->has('charts.profitTrend')
            ->has('charts.profitBreakdown')
            ->has('stats.estimatedProfit')
        );
        $this->actingAs($admin)->get(route('ai.index'))->assertOk()->assertInertia(fn ($page) => $page
            ->component('Ai/CommandCenter')
            ->where('ai.mode', 'admin')
        );
    }

    public function test_admin_can_manage_courier_health_and_rate_slabs(): void
    {
        $this->seed();
        $admin = User::where('email', 'admin@example.com')->firstOrFail();
        $seller = User::where('email', 'seller@example.com')->firstOrFail();
        $courier = Courier::where('code', 'TCS')->firstOrFail();
        $rate = CourierRate::whereBelongsTo($courier)->firstOrFail();

        $this->actingAs($seller)->get(route('admin.couriers.index'))->assertForbidden();

        $this->actingAs($admin)
            ->get(route('admin.couriers.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Couriers/Index')
                ->has('couriers')
            );

        $this->actingAs($admin)->patch(route('admin.couriers.update', $courier), [
            'api_status' => 'connected',
            'api_mode' => 'production',
            'api_credentials_status' => 'verified',
            'country_scope' => 'pakistan',
            'api_capabilities' => [
                'book' => true,
                'track' => true,
                'cancel' => true,
                'label' => true,
                'webhook' => true,
                'return_proof' => true,
            ],
            'base_success_rate' => 96.5,
            'is_active' => true,
        ])->assertRedirect(route('admin.couriers.index'));

        $courier->refresh();
        $this->assertSame('connected', $courier->api_status);
        $this->assertSame('production', $courier->api_mode);
        $this->assertTrue($courier->api_capabilities['return_proof']);
        $this->assertSame('96.50', $courier->base_success_rate);

        $this->actingAs($admin)
            ->post(route('admin.couriers.health-check', $courier))
            ->assertRedirect();

        $this->assertNotNull($courier->refresh()->last_api_health_check_at);

        $this->actingAs($admin)->patch(route('admin.rates.update', $rate), [
            'base_weight_grams' => 500,
            'base_rate_paisa' => 28500,
            'additional_kg_rate_paisa' => 31000,
            'our_fee_paisa' => 0,
            'delivery_days_min' => 1,
            'delivery_days_max' => 4,
            'success_rate' => 95.25,
            'is_active' => true,
            'rate_slabs' => [
                ['upto_grams' => 500, 'rate_paisa' => 28500],
                ['upto_grams' => 1000, 'rate_paisa' => 30500],
                ['extra_kg_rate_paisa' => 31000],
            ],
        ])->assertRedirect(route('admin.couriers.index'));

        $rate->refresh();
        $this->assertSame(28500, $rate->base_rate_paisa);
        $this->assertSame(31000, $rate->additional_kg_rate_paisa);
        $this->assertSame(4, $rate->delivery_days_max);
        $this->assertSame(31000, $rate->rate_slabs[2]['extra_kg_rate_paisa']);
    }

    public function test_seller_can_operate_shipment_detail_lifecycle(): void
    {
        $this->seed();
        $seller = User::where('email', 'seller@example.com')->firstOrFail();
        $otherSeller = User::factory()->create(['role' => 'seller', 'phone' => '03008887777']);
        $shipment = Shipment::query()
            ->whereBelongsTo($seller, 'seller')
            ->where('status', 'booked')
            ->firstOrFail();

        $this->actingAs($otherSeller)->get(route('shipments.show', $shipment))->assertForbidden();

        $this->actingAs($seller)
            ->get(route('shipments.show', $shipment))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Shipments/Show')
                ->where('shipment.trackingNumber', $shipment->tracking_number)
                ->has('shipment.events')
            );

        $this->actingAs($seller)
            ->post(route('shipments.sync', $shipment))
            ->assertRedirect();

        $shipment->refresh();
        $this->assertSame('transit', $shipment->status);
        $this->assertNotNull($shipment->api_synced_at);

        $bookedShipment = Shipment::query()
            ->whereBelongsTo($seller, 'seller')
            ->where('status', 'booked')
            ->firstOrFail();

        $this->actingAs($seller)
            ->post(route('shipments.cancel', $bookedShipment))
            ->assertRedirect();

        $bookedShipment->refresh();
        $this->assertSame('cancelled', $bookedShipment->status);
        $this->assertTrue($bookedShipment->events()->where('status', 'cancelled')->exists());
    }

    public function test_seller_can_generate_payout_invoice_for_delivered_cod(): void
    {
        $this->seed();
        $seller = User::where('email', 'seller@example.com')->firstOrFail();
        $eligibleCod = Shipment::query()
            ->whereBelongsTo($seller, 'seller')
            ->where('status', 'delivered')
            ->where('cod_amount_paisa', '>', 0)
            ->sum('cod_amount_paisa');

        $this->actingAs($seller)
            ->post(route('payouts.invoices.store'))
            ->assertRedirect();

        $invoice = PayoutInvoice::whereBelongsTo($seller, 'seller')->firstOrFail();

        $this->assertSame($eligibleCod, $invoice->gross_cod_paisa);
        $this->assertSame(8500, $invoice->bank_charge_paisa);
        $this->assertSame((int) round($eligibleCod * 0.01), $invoice->cash_handling_paisa);
        $this->assertSame((int) round($eligibleCod * 0.04), $invoice->cod_fee_paisa);
        $this->assertSame($eligibleCod - 8500 - (int) round($eligibleCod * 0.01) - (int) round($eligibleCod * 0.04), $invoice->net_payable_paisa);
        $this->assertSame('generated', $invoice->status);
        $this->assertSame(
            Shipment::whereBelongsTo($seller, 'seller')->where('status', 'delivered')->where('cod_amount_paisa', '>', 0)->count(),
            $invoice->shipments()->count()
        );

        $this->actingAs($seller)
            ->get(route('payouts.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Payouts/Index')
                ->where('summary.grossCod', 0)
                ->where('bankReadiness.provider', 'undecided')
                ->has('invoices', 1)
            );
    }

    public function test_admin_can_review_and_mark_payout_invoice_paid(): void
    {
        $this->seed();
        $seller = User::where('email', 'seller@example.com')->firstOrFail();
        $admin = User::where('email', 'admin@example.com')->firstOrFail();

        $this->actingAs($seller)
            ->post(route('payouts.invoices.store'))
            ->assertRedirect();

        $invoice = PayoutInvoice::whereBelongsTo($seller, 'seller')->firstOrFail();

        $this->actingAs($seller)
            ->get(route('admin.payouts.index'))
            ->assertForbidden();

        $this->actingAs($admin)
            ->get(route('admin.payouts.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Payouts/Index')
                ->where('stats.generated', 1)
                ->where('stats.pendingAmount', $invoice->net_payable_paisa)
                ->where('bankConfig.provider', 'undecided')
                ->where('invoices.0.invoiceNumber', $invoice->invoice_number)
            );

        $this->actingAs($admin)
            ->post(route('admin.payouts.bank-ready', $invoice))
            ->assertRedirect();

        $invoice->refresh();
        $this->assertSame('ready', $invoice->bank_transfer_status);
        $this->assertNotNull($invoice->bank_ready_at);

        $this->actingAs($admin)
            ->get(route('admin.payouts.bank-file.export'))
            ->assertOk()
            ->assertHeader('Content-Type', 'text/csv; charset=utf-8');

        $invoice->refresh();
        $this->assertSame('exported', $invoice->bank_transfer_status);
        $this->assertNotNull($invoice->bank_export_batch);

        $this->actingAs($admin)
            ->post(route('admin.payouts.bank-processing', $invoice))
            ->assertRedirect();

        $this->actingAs($admin)
            ->post(route('admin.payouts.mark-paid', $invoice), ['bank_payment_reference' => 'BANK-REF-123'])
            ->assertRedirect();

        $invoice->refresh();
        $this->assertSame('paid', $invoice->status);
        $this->assertSame('paid', $invoice->bank_transfer_status);
        $this->assertSame('BANK-REF-123', $invoice->bank_payment_reference);
        $this->assertNotNull($invoice->paid_at);

        $this->actingAs($seller)
            ->get(route('payouts.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('invoices.0.status', 'paid')
                ->where('invoices.0.bankTransferStatus', 'paid')
                ->where('invoices.0.bankPaymentReference', 'BANK-REF-123')
            );
    }

    public function test_admin_can_operate_shipments_and_verify_sellers(): void
    {
        Notification::fake();
        $this->seed();
        $seller = User::where('email', 'seller@example.com')->firstOrFail();
        $admin = User::where('email', 'admin@example.com')->firstOrFail();
        $shipment = Shipment::whereBelongsTo($seller, 'seller')->where('status', 'booked')->firstOrFail();

        $this->actingAs($seller)->get(route('admin.shipments.index'))->assertForbidden();

        $this->actingAs($admin)
            ->get(route('admin.shipments.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/Shipments/Index')->has('shipments.data'));

        $this->actingAs($admin)
            ->patch(route('admin.shipments.status', $shipment), [
                'status' => 'delivered',
                'remarks' => 'Manual POD verified.',
            ])
            ->assertRedirect();

        $shipment->refresh();
        $this->assertSame('delivered', $shipment->status);
        $this->assertNotNull($shipment->delivered_at);

        $this->actingAs($admin)
            ->get(route('admin.sellers.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/Sellers/Index')->has('sellers'));

        $this->actingAs($admin)
            ->patch(route('admin.sellers.update', $seller), ['verification_status' => 'rejected'])
            ->assertRedirect();

        $this->assertSame('rejected', $seller->sellerProfile()->first()->verification_status);
        $this->assertNotNull($seller->sellerProfile()->first()->reviewed_at);
        $this->assertNotEmpty($seller->sellerProfile()->first()->rejection_reason);
    }

    public function test_unverified_seller_cannot_book_shipments_until_kyc_is_approved(): void
    {
        $this->seed();

        $seller = User::where('email', 'seller@example.com')->firstOrFail();
        $seller->sellerProfile()->update(['verification_status' => 'pending']);

        $this->actingAs($seller)
            ->get(route('bookings.create'))
            ->assertRedirect(route('profile.edit'))
            ->assertSessionHas('error');

        $seller->sellerProfile()->update(['verification_status' => 'verified']);
        $seller->unsetRelation('sellerProfile');

        $this->actingAs($seller)
            ->get(route('bookings.create'))
            ->assertOk();
    }

    public function test_reports_and_public_company_pages_render(): void
    {
        $this->seed();
        $seller = User::where('email', 'seller@example.com')->firstOrFail();
        $admin = User::where('email', 'admin@example.com')->firstOrFail();

        $this->actingAs($seller)->get(route('reports.seller'))->assertOk()->assertInertia(fn ($page) => $page->component('Reports/Seller'));
        $this->actingAs($seller)->get(route('reports.admin'))->assertForbidden();
        $this->actingAs($admin)->get(route('reports.admin'))->assertOk()->assertInertia(fn ($page) => $page->component('Reports/Admin'));

        $this->get(route('contact'))->assertOk()->assertInertia(fn ($page) => $page->component('Marketing/Contact'));
        $this->get(route('about'))->assertOk()->assertInertia(fn ($page) => $page->component('Marketing/About'));
        $this->get(route('services'))->assertOk()->assertInertia(fn ($page) => $page->component('Marketing/Services'));
        $this->get(route('pricing'))->assertOk()->assertInertia(fn ($page) => $page->component('Marketing/Pricing'));
        $this->get(route('integrations'))->assertOk()->assertInertia(fn ($page) => $page->component('Marketing/Integrations'));
        $this->get(route('advance-cod'))->assertOk()->assertInertia(fn ($page) => $page->component('Marketing/AdvanceCod'));
        $this->get(route('claims'))->assertOk()->assertInertia(fn ($page) => $page->component('Marketing/Claims'));
        $this->get(route('bulk-shipping'))->assertOk()->assertInertia(fn ($page) => $page->component('Marketing/BulkShipping'));
        $this->get(route('faq'))->assertOk()->assertInertia(fn ($page) => $page->component('Marketing/Faq'));
        $this->get(route('privacy'))->assertOk()->assertInertia(fn ($page) => $page->component('Marketing/Privacy'));
        $this->get(route('terms'))->assertOk()->assertInertia(fn ($page) => $page->component('Marketing/Terms'));
    }

    public function test_contact_form_and_chatbot_work(): void
    {
        $this->post(route('contact.submit'), [
            'name' => 'Demo Seller',
            'email' => 'seller.demo@example.com',
            'phone' => '03001234567',
            'company' => 'Demo Store',
            'topic' => 'seller_onboarding',
            'message' => 'I want to join Fast Couriers.',
        ])->assertRedirect();

        $this->assertDatabaseHas('contact_messages', [
            'email' => 'seller.demo@example.com',
            'topic' => 'seller_onboarding',
            'status' => 'new',
        ]);

        $this->postJson(route('chatbot.message'), [
            'message' => 'What are your courier rates?',
        ])->assertOk()
            ->assertJsonFragment(['reply' => 'Fast Couriers lets sellers compare courier charges before booking. Current sample rates include Leopards/Trax/M&P/BlueEx from Rs.248.99, TCS from Rs.280, and Overland from Rs.450.']);
    }
}
