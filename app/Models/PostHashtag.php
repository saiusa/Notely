<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PostHashtag extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';

    public $timestamps = false;

    protected $fillable = [
        'post_id',
        'hashtag_id',
    ];

    protected function casts(): array
    {
        return [];
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'post_id', 'post_id');
    }

    public function hashtag(): BelongsTo
    {
        return $this->belongsTo(Hashtag::class, 'hashtag_id', 'hashtag_id');
    }
}
