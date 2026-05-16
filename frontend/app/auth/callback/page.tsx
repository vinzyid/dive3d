'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AuthCallbackPage() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const name  = searchParams.get('name');
        const email = searchParams.get('email');
        const error = searchParams.get('error');

        if (error || !token) {
            window.location.href = '/login?error=google_failed';
            return;
        }

        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_role', 'user');
        localStorage.setItem('user_name', name || '');
        localStorage.setItem('user_email', email || '');

        window.location.href = '/dashboard';
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-[#00040a] flex items-center justify-center text-white">
            <div className="text-center">
                <div className="text-4xl mb-4 animate-spin">⟳</div>
                <p className="text-cyan-400 font-bold tracking-widest uppercase text-sm">
                    Menyelesaikan login...
                </p>
            </div>
        </div>
    );
}
