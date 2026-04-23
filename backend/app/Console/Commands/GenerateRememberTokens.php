<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class GenerateRememberTokens extends Command
{
    protected $signature = 'tokens:generate-remember-tokens {--force : Force regeneration of existing tokens}';
    protected $description = 'Generate remember_tokens for users who don\'t have one';

    public function handle(): void
    {
        $force = $this->option('force');
        
        if ($force) {
            // Regenerate all tokens
            $query = User::query();
            $message = 'Regenerating remember tokens for all users...';
        } else {
            // Only generate for users without tokens
            $query = User::whereNull('remember_token');
            $message = 'Generating remember tokens for users without one...';
        }

        $count = $query->count();

        if ($count === 0) {
            $this->info('No users need remember tokens.');
            return;
        }

        $this->info($message);
        $bar = $this->output->createProgressBar($count);
        $bar->start();

        $query->each(function (User $user) use ($bar) {
            $user->update([
                'remember_token' => Str::random(100),
            ]);
            $bar->advance();
        });

        $bar->finish();
        $this->newLine();
        $this->info("Successfully generated remember tokens for {$count} users.");
    }
}
