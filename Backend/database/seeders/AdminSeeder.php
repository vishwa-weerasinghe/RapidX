<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;


class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Promote client to admin
        User::where('Email', 'minneriyawildjeepsafari@gmail.com')
            ->update(['role' => 'admin']);

        // Remove demo admin account
        User::where('Email', 'admin@rapidx.com')->delete();
    }
}
