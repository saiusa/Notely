<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Community extends Model
{
    use HasFactory;

    protected $primaryKey = 'community_id';

    const UPDATED_AT = null;

    protected $fillable = [
        'name',
        'description',
        'image',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
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

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class, 'community_id', 'community_id');
    }
}
