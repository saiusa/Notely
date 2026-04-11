<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    protected $primaryKey = 'category_id';

    const UPDATED_AT = null;

    protected $fillable = [
        'name',
        'slug',
        'image',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function communities(): HasMany
    {
        return $this->hasMany(Community::class, 'category_id', 'category_id');
    }
}
