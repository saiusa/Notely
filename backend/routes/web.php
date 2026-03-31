<?php

use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

// Auth routes are handled by React SPA, not Laravel Blade views
// Auth::routes();

// Route::get('/home', [HomeController::class, 'index'])->name('home');

Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');