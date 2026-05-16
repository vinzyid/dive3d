<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ContentsTableSeeder extends Seeder
{

    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        \DB::table('contents')->delete();

        \DB::table('contents')->insert([
            [
                'user_id' => 1,
                'user_type' => 'App\Models\Admin',
                'title' => 'Terumbu Karang Raja Ampat',
                'category' => 'Pemandangan',
                'author' => 'Admin Dive3D',
                'file_path' => 'gallery/coral_reef_01.jpg',
                'status' => 'approved',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 1,
                'user_type' => 'App\Models\Admin',
                'title' => 'Ikan Badut di Anemon',
                'category' => 'Biota Laut',
                'author' => 'Rossi',
                'file_path' => 'gallery/clownfish_01.jpg',
                'status' => 'approved',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 1,
                'user_type' => 'App\Models\Admin',
                'title' => 'Penyu Hijau Berenang',
                'category' => 'Biota Laut',
                'author' => 'Dive Master',
                'file_path' => 'gallery/turtle_01.jpg',
                'status' => 'approved',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}