<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
//packages
use App\Http\Controllers\PackageController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\DashboardController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/register', [AuthController::class, 'register']);

Route::post('/login', [AuthController::class, 'login']);    

Route::get('/dashboard', [AuthController::class, 'dashboard'])->middleware('auth:sanctum');

Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

Route::apiResource('packages', PackageController::class);
Route::apiResource('drivers', DriverController::class);
Route::apiResource('vehicles', VehicleController::class);
Route::apiResource('media', MediaController::class);
Route::get('appointments', [AppointmentController::class, 'index']);
Route::get('appointments/summary', [AppointmentController::class, 'summary']);
Route::middleware('auth:sanctum')->put('appointments/{booking}/driver', [AppointmentController::class, 'updateDriver']);

Route::get('reviews', [ReviewController::class, 'index']);
Route::get('reviews/{review}', [ReviewController::class, 'show']);



Route::get('/bookings', [BookingController::class, 'index']);
Route::post('/bookings', [BookingController::class, 'store']);
Route::put('/bookings/{id}', [BookingController::class, 'update']);
Route::delete('/bookings/{id}', [BookingController::class, 'destroy']);
Route::get('/bookings/{id}', [BookingController::class, 'show']);
Route::get('/user-bookings/{customerId}', [BookingController::class, 'userBookings']);
Route::get('/user-upcoming-booking/{customerId}', [BookingController::class, 'upcomingBooking']);

// Admin Dashboard Stats
Route::get('/admin/stats', [DashboardController::class, 'stats']);

Route::post('/cart/checkout', [CartController::class, 'checkout']);
Route::get('/cart/{customerId}', [CartController::class, 'index']);
Route::post('/cart', [CartController::class, 'store']);
Route::delete('/cart/{bookingId}', [CartController::class, 'destroy']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/customer-profile', function (\Illuminate\Http\Request $request) {
        return response()->json(\App\Models\Customer::find($request->user()->Customer_ID));
    });
    Route::post('reviews', [ReviewController::class, 'store']);
    Route::put('reviews/{review}', [ReviewController::class, 'update']);
    Route::patch('reviews/{review}', [ReviewController::class, 'update']);
    Route::delete('reviews/{review}', [ReviewController::class, 'destroy']);
});
