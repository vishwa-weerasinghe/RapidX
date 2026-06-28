<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
//packages
use App\Http\Controllers\PackageController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\ReviewController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/register', [AuthController::class, 'register']);

Route::post('/login', [AuthController::class, 'login']);    

Route::get('/dashboard', [AuthController::class, 'dashboard'])->middleware('auth:sanctum'); 

Route::apiResource('packages', PackageController::class);
Route::apiResource('drivers', DriverController::class);
Route::apiResource('media', MediaController::class);

Route::get('reviews', [ReviewController::class, 'index']);
Route::get('reviews/{review}', [ReviewController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('reviews', [ReviewController::class, 'store']);
    Route::put('reviews/{review}', [ReviewController::class, 'update']);
    Route::patch('reviews/{review}', [ReviewController::class, 'update']);
    Route::delete('reviews/{review}', [ReviewController::class, 'destroy']);
});