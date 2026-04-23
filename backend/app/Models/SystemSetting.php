<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $fillable = [
        'maintenance_mode',
        'disable_registrations',
        'global_announcement',
    ];

    protected function casts(): array
    {
        return [
            'maintenance_mode'      => 'boolean',
            'disable_registrations' => 'boolean',
        ];
    }

    /**
     * Always work with the single settings row (ID 1).
     * Creates it with defaults if it doesn't exist yet.
     */
    public static function instance(): static
    {
        return static::firstOrCreate(
            ['id' => 1],
            [
                'maintenance_mode'      => false,
                'disable_registrations' => false,
                'global_announcement'   => null,
            ]
        );
    }
}
