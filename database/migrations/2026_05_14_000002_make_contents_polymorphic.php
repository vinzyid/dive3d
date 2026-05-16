<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('contents', function (Blueprint $table) {
            // Hapus foreign key lama
            $table->dropForeign(['user_id']);
            
            // Tambahkan user_type untuk polymorphic relationship
            $table->string('user_type')->default('App\\Models\\User')->after('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contents', function (Blueprint $table) {
            $table->dropColumn('user_type');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });
    }
};
