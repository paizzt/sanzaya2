<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string'],
            'password' => ['required', 'string'],
        ];
    }

    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $login = trim((string) $this->input('email'));
        $loginLower = mb_strtolower($login);
        $password = (string) $this->input('password');
        $remember = $this->boolean('remember');

        // Cari kandidat user berdasarkan:
        // 1. Kolom email sama persis (bisa berisi email maupun username)
        // 2. Kolom name (nama lengkap / username) sama persis (case-insensitive)
        // 3. Jika input tanpa '@', cocokkan juga dengan bagian depan email sebelum '@' (misal: "faiz" cocok dengan "faiz@gmail.com")
        $candidates = User::where(function ($query) use ($loginLower) {
            $query->whereRaw('LOWER(email) = ?', [$loginLower])
                  ->orWhereRaw('LOWER(name) = ?', [$loginLower]);

            if (! str_contains($loginLower, '@')) {
                $query->orWhereRaw('LOWER(email) LIKE ?', [$loginLower . '@%']);
            }
        })->get();

        $matchedUser = null;
        foreach ($candidates as $candidate) {
            if (Hash::check($password, $candidate->password)) {
                $matchedUser = $candidate;
                break;
            }
        }

        if (! $matchedUser) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        if (! $matchedUser->is_active) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => 'Akun Anda telah dinonaktifkan.',
            ]);
        }

        Auth::login($matchedUser, $remember);

        RateLimiter::clear($this->throttleKey());
    }

    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }
}
