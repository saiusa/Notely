<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    /**
     * Get all categories with their communities
     */
    public function index(): JsonResponse
    {
        $categories = Category::query()
            ->with([
                'communities' => function ($query) {
                    $query->withCount('communityMembers');
                },
            ])
            ->orderBy('created_at')
            ->get();

        return response()->json($categories);
    }

    /**
     * Get a single category with its communities
     */
    public function show(Category $category): JsonResponse
    {
        $category->load([
            'communities' => function ($query) {
                $query->withCount('communityMembers');
            },
        ]);

        return response()->json($category);
    }
}
