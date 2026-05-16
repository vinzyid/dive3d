<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;

class EmailVerificationController extends Controller
{
    public function verify(Request $request, $id, $hash)
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');

        $user = User::find($id);

        if (!$user) {
            return redirect($frontendUrl . '/?login=true&error=invalid_verification');
        }

        if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return redirect($frontendUrl . '/?login=true&error=invalid_verification');
        }

        if (!$request->hasValidSignature()) {
            return redirect($frontendUrl . '/?login=true&error=expired_verification');
        }

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        return redirect($frontendUrl . '/?login=true&verified=1');
    }

    public function resend(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user || $user->hasVerifiedEmail()) {
            // Jangan bocorkan apakah email ada atau sudah terverifikasi
            return response()->json(['message' => 'Jika email terdaftar dan belum diverifikasi, link telah dikirim.']);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Link verifikasi telah dikirim ke email Anda.']);
    }
}
