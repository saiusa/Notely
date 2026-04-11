<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Community extends Model
{
    use HasFactory;

    protected $primaryKey = 'community_id';

    protected $fillable = [
        'category_id',
        'user_id',
        'name',
        'slug',
        'description',
        'image',
        'rules',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'rules' => 'array',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id', 'category_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function communityMembers(): HasMany
    {
        return $this->hasMany(CommunityMember::class, 'community_id', 'community_id');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'community_members', 'community_id', 'user_id', 'community_id', 'user_id')
            ->withPivot('joined_at');
    }

    public function members(): BelongsToMany
    {
        return $this->users();
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class, 'community_id', 'community_id');
    }
}
