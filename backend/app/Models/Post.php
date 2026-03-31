<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    use HasFactory;

    protected $primaryKey = 'post_id';

    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'community_id',
        'content',
        'image',
        'mood_id',
        'privacy',
        'allow_comments',
        'is_anonymous',
    ];

    protected function casts(): array
    {
        return [
            'allow_comments' => 'boolean',
            'is_anonymous' => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function mood(): BelongsTo
    {
        return $this->belongsTo(Mood::class, 'mood_id', 'mood_id');
    }

    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class, 'community_id', 'community_id');
    }

    public function likes(): HasMany
    {
        return $this->hasMany(Like::class, 'post_id', 'post_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class, 'post_id', 'post_id');
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class, 'post_id', 'post_id');
    }

    public function hashtags(): BelongsToMany
    {
        return $this->belongsToMany(Hashtag::class, 'post_hashtags', 'post_id', 'hashtag_id', 'post_id', 'hashtag_id');
    }
}
