<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Notification extends Model
{
    use HasFactory;

    protected $table = 'notifications';

    protected $fillable = [
        'user_id',
        'type',
        'message',
        'status',
        'retry_count',
        'processed_at',
    ];

    protected $casts = [
        'processed_at' => 'datetime',
    ];
}
