<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminSettingController extends Controller
{
    /**
     * GET /admin/settings
     * Returns the single system-settings row.
     */
    public function index(): JsonResponse
    {
        $settings = SystemSetting::instance();

        return response()->json([
            'success'  => true,
            'settings' => $settings,
        ], 200);
    }

    /**
     * GET /system-status  (PUBLIC — no auth required)
     * Returns only the fields the frontend UI needs.
     * Never exposes internal IDs or timestamps.
     */
    public function publicStatus(): JsonResponse
    {
        $s = SystemSetting::instance();

        return response()->json([
            'maintenance_mode'      => $s->maintenance_mode,
            'disable_registrations' => $s->disable_registrations,
            'global_announcement'   => $s->global_announcement,
        ], 200);
    }

    /**
     * PUT /admin/settings
     * Validates and updates the single system-settings row.
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'maintenance_mode'      => ['sometimes', 'boolean'],
            'disable_registrations' => ['sometimes', 'boolean'],
            'global_announcement'   => ['sometimes', 'nullable', 'string', 'max:1000'],
        ]);

        $settings = SystemSetting::instance();
        $settings->update($validated);

        return response()->json([
            'success'  => true,
            'message'  => 'System settings updated successfully.',
            'settings' => $settings->fresh(),
        ], 200);
    }
}
