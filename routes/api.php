<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\ContentController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\UserProgressController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GoogleAuthController;
use App\Http\Controllers\Api\RewardController;
use App\Http\Controllers\Api\EmailVerificationController;
use App\Http\Controllers\BadgeController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\QuizQuestionController;
use App\Http\Controllers\CertificateController;

// Endpoint Autentikasi
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:3,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

// Google OAuth
Route::get('/auth/google', [GoogleAuthController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);

// Email verification
Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->middleware('signed')
    ->name('verification.verify');
Route::post('/email/resend', [EmailVerificationController::class, 'resend'])
    ->middleware('throttle:3,1');

// Upload (bebas CSRF, tapi butuh auth agar user_id tersimpan)
Route::post('/upload', [ContentController::class, 'upload'])->middleware('auth:sanctum');

// Endpoint untuk Gallery (publik)
Route::get('/gallery', [GalleryController::class, 'index']);


// Endpoint untuk Modul Pembelajaran
Route::get('/modules', [ModuleController::class, 'index']);

// Endpoint publik quiz questions (read-only)
Route::get('/quiz/questions/{moduleSlug}', [QuizQuestionController::class, 'index']);

// Endpoint untuk Menyimpan dan Mengambil Data Progres
Route::middleware('auth:sanctum')->group(function () {

    // Rute Progres (Pindahan dari publik agar punya ID User Asli)
    Route::get('/progress/{slug}', [UserProgressController::class, 'show']);
    Route::post('/progress', [UserProgressController::class, 'update']);

    // Karya milik user sendiri (semua status: pending/approved/rejected)
    Route::get('/my-uploads', [ContentController::class, 'myUploads']);

    // Admin review (diproteksi)
    Route::middleware(\App\Http\Middleware\EnsureAdminRole::class)->group(function () {
        Route::prefix('/admin')->group(function () {
            Route::get('/pending', [ContentController::class, 'pending']);
            Route::post('/approve/{id}', [ContentController::class, 'approve']);
            Route::post('/reject/{id}', [ContentController::class, 'reject']);
            Route::delete('/gallery/{id}', [ContentController::class, 'destroy']);

            // Manajemen Modul
            Route::post('/modules', [ModuleController::class, 'store']);
            Route::put('/modules/{slug}', [ModuleController::class, 'update']);
            Route::delete('/modules/{slug}', [ModuleController::class, 'destroy']);
        });

        // Manajemen soal oleh Admin
        Route::post('/quiz/questions', [QuizQuestionController::class, 'store']);
        Route::delete('/quiz/questions/{id}', [QuizQuestionController::class, 'destroy']);
    });

    // Dashboard (butuh auth agar dapat nama user asli)
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Rute Badge
    Route::get('/badges', [BadgeController::class, 'index']);
    Route::get('/badges/my', [BadgeController::class, 'my']);

    // Rute Quiz
    Route::post('/quiz/submit', [QuizController::class, 'submit']);

    // Rute Sertifikat
    Route::get('/certificates', [CertificateController::class, 'index']);
    Route::post('/certificates/generate', [CertificateController::class, 'generate']);

    // Rute Hadiah (Rewards)
    Route::get('/rewards/eligibility', [RewardController::class, 'getEligibility']);
    Route::post('/rewards/claim', [RewardController::class, 'claim']);

    // Rute Logout
    Route::post('/logout', [AuthController::class, 'logout']);
});

// Verifikasi sertifikat (publik)
Route::get('/certificates/verify/{certificateNumber}', [CertificateController::class, 'verify']);

// Showcase
Route::get('/showcase', [ContentController::class, 'showcase']);

// Optional limit
Route::get('/showcase/{limit}', [ContentController::class, 'showcaseLimit']);

// Gallery paginated
Route::get('/gallery/paginated', [GalleryController::class, 'paginated']);

// 1. Mengambil soal kuis berdasarkan slug (Data is_correct disembunyikan)
Route::get('/quizzes/{slug}', [QuizController::class, 'show']);

// 2. Submit jawaban untuk dihitung skornya di Backend
Route::post('/quizzes/submit', [QuizController::class, 'submit']);



