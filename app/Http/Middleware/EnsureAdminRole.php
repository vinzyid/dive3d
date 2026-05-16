<?php

namespace App\Http\Middleware;

use App\Models\Admin;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminRole
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        $isAdmin = $user instanceof Admin || ($user && method_exists($user, 'isAdmin') && $user->isAdmin());

        if (!$isAdmin) {
            return response()->json([
                'message' => 'Akses ditolak. Hanya admin yang dapat mengakses resource ini.'
            ], 403);
        }

        return $next($request);
    }
}
