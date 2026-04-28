<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Community;
use App\Models\CommunityMember;
use App\Models\Post;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommunityController extends Controller
{
    /**
     * Generate a slug from a community name
     */
    private function generateSlug(string $name): string
    {
        $slug = preg_replace('/[^a-z0-9]+/', '-', strtolower(trim($name)));
        return trim($slug, '-');
    }

    public function index(): JsonResponse
    {
        $communities = Community::query()
            ->with('category:category_id,name,slug,icon,color')
            ->withCount('communityMembers')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($communities);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'integer', 'exists:categories,category_id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'image' => ['nullable', 'file', 'image', 'max:2048'],
            'rules' => ['nullable', 'array'],
            'rules.*' => ['string', 'max:255'],
        ]);

        $validated['user_id'] = $request->user()->user_id;
        $validated['slug'] = $this->generateSlug($validated['name']);

        // Set default rules if not provided
        if (empty($validated['rules'])) {
            $validated['rules'] = [
                'Be respectful to all members',
                'Keep posts relevant to the category',
                'No spam or self-promotion',
            ];
        }

        // Handle image upload if present
        if ($request->hasFile('image')) {
            // Get category to find slug
            $category = Category::find($validated['category_id']);

            // Generate filename from community name (slug-friendly)
            $filename = strtolower(
                preg_replace('/[^a-z0-9]+/', '-', $validated['name'])
            ) . '.' . $request->file('image')->getClientOriginalExtension();

            // Store in category-specific folder
            $path = $request->file('image')->storeAs(
                "communities/category-list/{$category->slug}",
                $filename,
                'public'
            );
            $validated['image'] = '/storage/' . $path;
        }

        $community = Community::create($validated);

        // Automatically add creator as a member
        $community->users()->attach($request->user()->user_id, ['joined_at' => now()]);

        $community->load('category:category_id,name,slug,image', 'creator:user_id,username');

        return response()->json($community, 201);
    }

    public function show(Community $community): JsonResponse
    {
        $community->load([
            'category:category_id,name,slug,image',
            'members:user_id,username,email',
            'members.profile:profile_id,user_id,profile_picture',
        ])->loadCount('communityMembers');

        return response()->json($community);
    }

    public function update(Request $request, Community $community): JsonResponse
    {
        // Authorize: only the creator can edit
        if ($request->user()->user_id !== $community->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'category_id' => ['required', 'integer', 'exists:categories,category_id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'image' => ['nullable', 'file', 'image', 'max:2048'],
            'rules' => ['nullable', 'array'],
            'rules.*' => ['string', 'max:255'],
        ]);

        // Update basic fields
        $community->name = $validated['name'];
        $community->slug = $this->generateSlug($validated['name']);
        $community->description = $validated['description'];
        $community->category_id = $validated['category_id'];

        // Update rules if provided
        if (isset($validated['rules'])) {
            $community->rules = $validated['rules'];
        }

        // Handle image upload if a new image is provided
        if ($request->hasFile('image')) {
            // Get category for folder structure
            $category = Category::find($validated['category_id']);

            // Generate new filename
            $filename = strtolower(
                preg_replace('/[^a-z0-9]+/', '-', $validated['name'])
            ) . '.' . $request->file('image')->getClientOriginalExtension();

            // Store in category-specific folder
            $path = $request->file('image')->storeAs(
                "communities/category-list/{$category->slug}",
                $filename,
                'public'
            );
            $community->image = '/storage/' . $path;
        }

        $community->save();
        $community->load('category:category_id,name,slug,image', 'creator:user_id,username');

        return response()->json($community);
    }

    public function posts(Request $request, Community $community): JsonResponse
    {
        $user = $request->user();
        $isMember = CommunityMember::query()
            ->where('user_id', $user->user_id)
            ->where('community_id', $community->community_id)
            ->exists();

        $posts = Post::query()
            ->where('community_id', $community->community_id)
            ->where(function (Builder $query) use ($user, $isMember): void {
                $query->where('privacy', 'public')
                    ->orWhere('user_id', $user->user_id);

                if ($isMember) {
                    $query->orWhere('privacy', 'private');
                }
            })
            ->with([
                'user:user_id,username',
                'user.profile:profile_id,user_id,profile_picture',
                'user.setting:user_id,show_reaction_counts,hide_comments',
                'community:community_id,name,category_id',
                'community.category:category_id,slug,name',
                'mood:mood_id,name,color',
                'hashtags:hashtag_id,name',
            ])
            ->withCount(['comments', 'likes'])
            ->orderByDesc('created_at')
            ->paginate(15);

        return response()->json($posts);
    }
}
