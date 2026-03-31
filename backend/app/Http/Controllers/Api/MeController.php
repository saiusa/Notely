<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MeController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->load([
            'profile',
            'setting',
            'communities:communities.community_id,communities.name,communities.description,communities.image,communities.created_at',
        ]);

        return response()->json($user);
    }
}
