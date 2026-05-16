<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // --- Akun default (firstOrCreate agar tidak duplikat) ---
        $adminRole = Role::firstOrCreate(
            ['name' => 'admin'],
            ['description' => 'Administrator']
        );

        $userRole = Role::firstOrCreate(
            ['name' => 'user'],
            ['description' => 'Regular user']
        );

        \App\Models\Admin::firstOrCreate(
            ['email' => 'admin@email.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('admin123'),
            ]
        );

        $defaultUser = User::firstOrCreate(
            ['email' => 'rafi@email.com'],
            [
                'name' => 'Rafi',
                'password' => Hash::make('password'),
            ]
        );

        // --- Akun admin di tabel admins (terpisah dari users) ---
        Admin::firstOrCreate(
            ['email' => 'admin@email.com'],
            [
                'name'     => 'Admin',
                'password' => Hash::make('admin123'),
            ]
        );

        // --- Konten pembelajaran ---
        $this->call([
            ModuleSeeder::class,
            PointOfInterestSeeder::class,
            BadgeSeeder::class,
            QuizDataSeeder::class,
        ]);

        // --- Backup Data Transaksional ---
        $this->call(ContentsTableSeeder::class);
        $this->call(UserProgressTableSeeder::class);
        $this->call(QuizResultsTableSeeder::class);
        $this->call(UserBadgesTableSeeder::class);
    }
}
