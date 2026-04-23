<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Like extends Model
{
    use HasFactory;

    protected $primaryKey = 'like_id';

    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'post_id',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    /**
     * Auto-sync the parent post's likes_count counter.
     * Runs on every Like create / delete — no manual increments needed elsewhere.
     */
    protected static function booted(): void
    {
        static::created(function (Like $like): void {
            Post::where('post_id', $like->post_id)->increment('likes_count');
        });

        static::deleted(function (Like $like): void {
            Post::where('post_id', $like->post_id)->decrement('likes_count');
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'post_id', 'post_id');
    }
}
