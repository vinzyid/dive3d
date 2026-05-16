<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $defaultRole = Role::firstOrCreate(
            ['name' => 'user'],
            ['description' => 'Regular user']
        );

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registrasi berhasil',
            'user'    => $user,
            'token'   => $token,
            'role'    => $user->role_name,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = null;
        $role = 'user';

        // Cek apakah admin
        if ($request->email === 'admin@email.com') {
            $user = \App\Models\Admin::where('email', $request->email)->first();
            $role = 'admin';
        } else {
            $user = User::where('email', $request->email)->first();
            $role = 'user';
        }

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Alamat email atau kata sandi salah.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'user'    => $user,
            'token'   => $token,
            'role'    => $role,
        ]);
    }

    public function logout(Request $request)
    {
        // Mendapatkan user yang sedang login dan menghapus semua tokennya
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logout berhasil'
        ]);
    }
}
