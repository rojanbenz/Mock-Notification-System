<?php 

use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\NotificationRateLimit;


Route::prefix('notifications')->group(function () {
    // Route::post('/', [NotificationController::class, 'store']);
    Route::post('/', [NotificationController::class, 'store'])->middleware(NotificationRateLimit::class);
    Route::get('/recent/{userId}', [NotificationController::class, 'recent']);
    Route::get('/summary/{userId}', [NotificationController::class, 'summary']);
    Route::post('/{notification}/status', [NotificationController::class, 'updateStatus']);
});