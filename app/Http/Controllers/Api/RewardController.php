<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\RewardClaimedMail;
use App\Models\QuizResult;
use App\Models\RewardClaim;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class RewardController extends Controller
{
    /**
     * Get user's top score and claimed rewards.
     */
    public function getEligibility()
    {
        $user = Auth::user();
        
        $topScore = QuizResult::where('user_id', $user->id)->max('score') ?? 0;
        
        $claimedRewards = RewardClaim::where('user_id', $user->id)
            ->pluck('reward_type')
            ->toArray();

        return response()->json([
            'topScore' => $topScore,
            'claimedRewards' => $claimedRewards,
            'requirements' => [
                'ebook' => 50,
                'voucher' => 75,
                'webinar' => 90,
                'tshirt' => 100
            ]
        ]);
    }

    /**
     * Claim a reward.
     */
    public function claim(Request $request)
    {
        $request->validate([
            'reward_type' => 'required|string|in:ebook,voucher,webinar,tshirt'
        ]);

        $user = Auth::user();
        $rewardType = $request->reward_type;

        // 1. Check if already claimed
        if (RewardClaim::where('user_id', $user->id)->where('reward_type', $rewardType)->exists()) {
            return response()->json(['message' => 'Hadiah ini sudah pernah diklaim sebelumnya.'], 400);
        }

        // 2. Check top score from database
        $topScore = QuizResult::where('user_id', $user->id)->max('score') ?? 0;

        $requirements = [
            'ebook' => 50,
            'voucher' => 75,
            'webinar' => 90,
            'tshirt' => 100
        ];

        $rewardNames = [
            'ebook' => 'E-Book Konservasi Laut',
            'voucher' => 'Voucher Diskon 15%',
            'webinar' => 'Tiket VIP Webinar',
            'tshirt' => 'T-Shirt Eksklusif Dive3D'
        ];

        if ($topScore < $requirements[$rewardType]) {
            return response()->json([
                'message' => "Skor Anda ($topScore) belum mencukupi untuk mengklaim {$rewardNames[$rewardType]}. Butuh minimal {$requirements[$rewardType]}."
            ], 403);
        }

        // 3. Save Claim
        RewardClaim::create([
            'user_id' => $user->id,
            'reward_type' => $rewardType,
            'claimed_at' => now()
        ]);

        // 4. Send Email
        try {
            Mail::to($user->email)->send(new RewardClaimedMail($rewardNames[$rewardType]));
            $emailStatus = "Email berhasil dikirim ke {$user->email}.";
        } catch (\Exception $e) {
            $emailStatus = "Klaim tercatat, tapi gagal mengirim email: " . $e->getMessage();
        }

        return response()->json([
            'message' => "Berhasil mengklaim {$rewardNames[$rewardType]}! " . $emailStatus,
            'reward_type' => $rewardType
        ]);
    }
}
