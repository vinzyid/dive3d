<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserProgress;
use App\Models\Module;
use App\Services\BadgeService;

class UserProgressController extends Controller
{
    public function show($slug)
    {
        if (!(auth()->user() instanceof \App\Models\User)) {
            return response()->json(['message' => 'Admin tidak memiliki data progres.'], 403);
        }

        $module = Module::where('slug', $slug)->firstOrFail();

        $progress = UserProgress::firstOrCreate(
            ['user_id' => auth()->id(), 'module_id' => $module->id],
            ['visited_pois' => [], 'completed' => false]
        );

        return response()->json([
            'moduleId'    => $module->slug,
            'visitedPois' => $progress->visited_pois ?? [],
            'completed'   => $progress->completed
        ]);
    }

    public function update(Request $request, BadgeService $badgeService)
    {
        if (!(auth()->user() instanceof \App\Models\User)) {
            return response()->json(['message' => 'Admin tidak dapat menyimpan progres.'], 403);
        }

        $request->validate([
            'moduleId'    => 'required|string',
            'visitedPois' => 'nullable|array',
            'completed'   => 'required|boolean'
        ]);

        $module = Module::where('slug', $request->moduleId)->firstOrFail();

        $progress = UserProgress::updateOrCreate(
            ['user_id' => auth()->id(), 'module_id' => $module->id],
            [
                'visited_pois' => $request->visitedPois ?? [],
                'completed'    => $request->completed
            ]
        );

        $newBadges = $badgeService->checkAndAward(auth()->id());

        return response()->json([
            'message'    => 'Progres berhasil disimpan.',
            'data'       => $progress,
            'new_badges' => $newBadges,
        ]);
    }
}
