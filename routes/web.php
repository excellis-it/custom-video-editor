<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\VideoController;

Route::get('/', [VideoController::class, 'index'])->name('videos.index');
Route::post('/upload', [VideoController::class, 'store'])->name('videos.store');
Route::get('/video/{id}', [VideoController::class, 'show'])->name('videos.show');
