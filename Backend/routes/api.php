<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
//packages
use App\Http\Controllers\PackageController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\MediaController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/register', [AuthController::class, 'register']);

Route::post('/login', [AuthController::class, 'login']);    

Route::get('/dashboard', [AuthController::class, 'dashboard'])->middleware('auth:sanctum'); 

Route::apiResource('packages', PackageController::class);
Route::apiResource('drivers', DriverController::class);
Route::apiResource('media', MediaController::class);