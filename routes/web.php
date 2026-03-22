<?php

use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Re-enable full web auth UI including forgot/reset password pages.
Auth::routes();

Route::get('/home', [HomeController::class, 'index'])->name('home');
