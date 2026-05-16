<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecureHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Menambahkan Security Headers
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN'); // Mencegah Clickjacking
        $response->headers->set('X-Content-Type-Options', 'nosniff'); // Mencegah MIME-sniffing
        $response->headers->set('X-XSS-Protection', '1; mode=block'); // Proteksi XSS dasar
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'geolocation=(), camera=(), microphone=()'); // Batasi akses fitur HP/Browser jika tidak dipakai

        return $response;
    }
}