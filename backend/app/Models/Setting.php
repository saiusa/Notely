<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Setting extends Model
{
    use HasFactory;

    protected $primaryKey = 'setting_id';

    const CREATED_AT = null;
    const UPDATED_AT = 'updated_at';

    protected $fillable = [
        'user_id',
        'default_post_privacy',
        'hide_comments',
        'show_reaction_counts',
        'notify_likes',
        'notify_comments',
        'email_notifications',
        'two_factor_enabled',
    ];

    protected function casts(): array
    {
        return [
            'hide_comments' => 'boolean',
            'show_reaction_counts' => 'boolean',
            'notify_likes' => 'boolean',
            'notify_comments' => 'boolean',
            'email_notifications' => 'boolean',
            'two_factor_enabled' => 'boolean',
            'updated_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}
