<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\User::firstOrCreate(
            ['Email' => 'admin@rapidx.com'],
            [
                'User_Name' => 'Admin User',
                'Password' => \Illuminate\Support\Facades\Hash::make('password123'),
                'role' => 'admin',
                'Status' => 'Active'
            ]
        );
    }
}
