<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')
            ->stateless()
            ->redirect();
    }

    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            return redirect($frontendUrl . '/login?error=google_failed');
        }

        // Cek apakah user dengan email ini sudah ada (register manual)
        $existing = User::where('email', $googleUser->getEmail())->first();
        if ($existing) {
            $existing->update([
                'google_id'         => $googleUser->getId(),
                'avatar'            => $googleUser->getAvatar(),
                'email_verified_at' => $existing->email_verified_at ?? now(),
            ]);
            $user = $existing;
        } else {
            $user = User::create([
                'name'              => $googleUser->getName(),
                'email'             => $googleUser->getEmail(),
                'google_id'         => $googleUser->getId(),
                'avatar'            => $googleUser->getAvatar(),
                'password'          => bcrypt(\Illuminate\Support\Str::random(24)),
                'email_verified_at' => now(),
            ]);
        }

        $token = $user->createToken('google-auth-token')->plainTextToken;

        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        return redirect($frontendUrl . '/auth/callback?token=' . $token . '&name=' . urlencode($user->name) . '&email=' . urlencode($user->email));
    }
}
