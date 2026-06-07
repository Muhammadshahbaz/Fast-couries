<?php

namespace App\Http\Controllers;

use App\Support\AiLogisticsAdvisor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AiCommandCenterController extends Controller
{
    public function __invoke(Request $request, AiLogisticsAdvisor $advisor): Response
    {
        $user = $request->user();
        $payload = in_array($user->role, ['super_admin', 'sub_admin'], true)
            ? $advisor->admin()
            : $advisor->seller($user);

        return Inertia::render('Ai/CommandCenter', [
            'ai' => $payload,
        ]);
    }
}
