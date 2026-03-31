<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Mood extends Model
{
    use HasFactory;

    protected $primaryKey = 'mood_id';

    public $timestamps = false;

    protected $fillable = [
        'name',
        'color',
    ];

    protected function casts(): array
    {
        return [];
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class, 'mood_id', 'mood_id');
    }
}
