<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MarketingPageController extends Controller
{
    public function about(): Response
    {
        return Inertia::render('Marketing/About');
    }

    public function services(): Response
    {
        return Inertia::render('Marketing/Services');
    }

    public function pricing(): Response
    {
        return Inertia::render('Marketing/Pricing');
    }

    public function integrations(): Response
    {
        return Inertia::render('Marketing/Integrations');
    }

    public function advanceCod(): Response
    {
        return Inertia::render('Marketing/AdvanceCod');
    }

    public function codPolicy(): Response
    {
        return Inertia::render('Marketing/CodPolicy');
    }

    public function deploymentChecklist(): Response
    {
        return Inertia::render('Marketing/DeploymentChecklist');
    }

    public function operationsSop(): Response
    {
        return Inertia::render('Marketing/OperationsSop');
    }

    public function claims(): Response
    {
        return Inertia::render('Marketing/Claims');
    }

    public function bulkShipping(): Response
    {
        return Inertia::render('Marketing/BulkShipping');
    }

    public function faq(): Response
    {
        return Inertia::render('Marketing/Faq');
    }

    public function contact(): Response
    {
        return Inertia::render('Marketing/Contact');
    }

    public function submitContact(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'company' => ['nullable', 'string', 'max:160'],
            'topic' => ['required', 'string', 'max:80'],
            'message' => ['required', 'string', 'max:2000'],
        ]);

        ContactMessage::create($validated);

        return back()->with('success', 'Thanks. Our team will contact you shortly.');
    }

    public function privacy(): Response
    {
        return Inertia::render('Marketing/Privacy');
    }

    public function terms(): Response
    {
        return Inertia::render('Marketing/Terms');
    }
}
