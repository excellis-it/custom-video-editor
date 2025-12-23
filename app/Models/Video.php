<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Video extends Model
{
    protected $fillable = ['title', 'video_path', 'is_youtube', 'thumbnail_path', 'thumbnail_timing'];
}
