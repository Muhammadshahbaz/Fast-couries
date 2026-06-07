<?php

namespace App\Http\Controllers;

use App\Models\TeamMember;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Team/Index', [
            'members' => TeamMember::where('seller_id', $request->user()->id)->latest()->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'email' => ['required', 'email', 'max:255', Rule::unique('team_members', 'email')->where('seller_id', $request->user()->id)],
            'role' => ['required', Rule::in(['admin', 'packer', 'dispatcher', 'finance'])],
        ]);

        $request->user()->teamMembers()->create($validated + ['is_active' => true]);

        return back()->with('success', 'Team member added.');
    }
}
