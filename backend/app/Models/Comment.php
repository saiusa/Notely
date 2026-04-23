<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Comment extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'comment_id';

    protected $fillable = [
        'user_id',
        'post_id',
        'parent_id',
        'content',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Auto-sync the parent post's comments_count counter.
     * Only top-level comments (no parent_id) count toward the total.
     * SoftDeletes: deleted() fires on soft-delete, restored() would fire on restore.
     */
    protected static function booted(): void
    {
        static::created(function (Comment $comment): void {
            if (! $comment->parent_id) {
                Post::where('post_id', $comment->post_id)->increment('comments_count');
            }
        });

        static::deleted(function (Comment $comment): void {
            if (! $comment->parent_id) {
                Post::where('post_id', $comment->post_id)->decrement('comments_count');
            }
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

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Comment::class, 'parent_id', 'comment_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(Comment::class, 'parent_id', 'comment_id');
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class, 'comment_id', 'comment_id');
    }
}
