<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class PlatformSetting extends Model
{
    protected $fillable = ['key', 'value', 'description', 'group'];
    public $timestamps = true;

    /**
     * Get a setting value with type coercion.
     * Cached for 60s to avoid hammering the DB on every transaction.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $value = Cache::remember("setting:{$key}", 60, function () use ($key) {
            return static::where('key', $key)->value('value');
        });

        if ($value === null) return $default;

        // Smart coercion: numeric strings → float, '1'/'0' → bool
        if (is_numeric($value)) return (float) $value;
        if ($value === '1' || $value === '0') return (bool) (int) $value;
        return $value;
    }

    public static function set(string $key, mixed $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => (string) $value]);
        Cache::forget("setting:{$key}");
    }
}
