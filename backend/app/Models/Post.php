<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Accessor;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'post_id';

    protected $fillable = [
        'user_id',
        'community_id',
        'type',
        'title',
        'content',
        'image',
        'mood_id',
        'privacy',
        'allow_comments',
        'is_anonymous',
        'anonymous_name',
        'views_count',
        'likes_count',
        'comments_count',
    ];

    protected function casts(): array
    {
        return [
            'allow_comments' => 'boolean',
            'is_anonymous' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
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

    /**
     * Expose the post owner's settings as a nested "settings" property on the post
     * This allows frontend to access post.settings.show_reaction_counts, etc.
     */
    #[Accessor]
    protected function settings(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->user?->setting,
        );
    }
}
