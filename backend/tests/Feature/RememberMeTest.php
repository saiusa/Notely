<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RememberMeTest extends TestCase
{
    use RefreshDatabase;

    public function test_web_login_with_remember_me_sets_remember_token(): void
    {
        $user = User::factory()->create([
            'email' => 'remember@example.com',
            'password' => 'StrongPass123!',
        ]);

        $this->post('/login', [
            'email' => 'remember@example.com',
            'password' => 'StrongPass123!',
            'remember' => 'on',
        ])->assertRedirect('/home');

        $this->assertAuthenticatedAs($user);
        $this->assertNotNull($user->fresh()->remember_token);
    }
}