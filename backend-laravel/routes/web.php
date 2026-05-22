<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\Auth\AuthController;

Route::get('/', function () {
    return view('welcome');
});

// ─── Google OAuth (must be web routes — they perform browser redirects) ───────
Route::get('/auth/google',          [AuthController::class, 'googleRedirect']);
Route::get('/auth/google/callback', [AuthController::class, 'googleCallback']);
