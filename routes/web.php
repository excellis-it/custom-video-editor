<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\VideoController;

Route::get('/', [VideoController::class, 'index'])->name('videos.index');
Route::post('/upload', [VideoController::class, 'store'])->name('videos.store');
Route::get('/video/{id}', [VideoController::class, 'show'])->name('videos.show');
Route::get('/videos/{id}', [VideoController::class, 'delete'])->name('videos.destroy');
Route::get('/videos/{id}/edit', [VideoController::class, 'edit'])->name('videos.edit');
Route::post('/videos/{id}/update', [VideoController::class, 'update'])->name('videos.update');
Route::post('/videos/{video}/reload-subtitle', [VideoController::class, 'reloadSubtitle'])->name('videos.reloadSubtitle');
