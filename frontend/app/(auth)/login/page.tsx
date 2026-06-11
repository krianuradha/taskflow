'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { setAccessToken } from '@/lib/auth';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  remember: z.boolean().optional()
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await api.post('/api/v1/auth/login', {
        email: values.email,
        password: values.password
      });
      if (response.data?.accessToken) {
        setAccessToken(response.data.accessToken);
      }
      router.push('/projects');
    } catch (error) {
      setMessage('Invalid credentials or account locked.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-md rounded-3xl bg-white px-8 py-10 shadow-soft transition-colors dark:bg-[#131b2e]">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-secondary-container">Welcome back</p>
          <h1 className="mt-3 text-3xl font-semibold text-text-heading">Sign in to TaskFlow</h1>
          <p className="mt-2 text-sm text-on-surface-variant">Continue managing your projects, teams, and tasks.</p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <label className="block text-sm font-medium text-on-surface">Email</label>
          <input
            className={cn(
              'w-full rounded-xl border border-border-subtle bg-surface px-4 py-3 text-base text-on-surface transition-colors',
              errors.email && 'border-error'
            )}
            type="email"
            autoComplete="email"
            {...register('email')}
          />
          {errors.email && <p className="text-sm text-error">{errors.email.message}</p>}

          <label className="block text-sm font-medium text-on-surface">Password</label>
          <input
            className={cn(
              'w-full rounded-xl border border-border-subtle bg-surface px-4 py-3 text-base text-on-surface transition-colors',
              errors.password && 'border-error'
            )}
            type="password"
            autoComplete="current-password"
            {...register('password')}
          />
          {errors.password && <p className="text-sm text-error">{errors.password.message}</p>}

          <div className="flex items-center justify-between text-sm text-on-surface-variant">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4 rounded border-border-subtle text-secondary" {...register('remember')} />
              Remember me
            </label>
            <a href="/forgot-password" className="font-medium text-secondary hover:underline">
              Forgot password?
            </a>
          </div>

          {message && <p className="rounded-2xl border border-error bg-error-container px-4 py-3 text-sm text-error">{message}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full justify-center rounded-2xl bg-secondary px-4 py-3 text-base font-semibold text-white transition hover:bg-[#0047b2] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-on-surface-variant">
          New to TaskFlow?{' '}
          <a href="/register" className="font-semibold text-secondary hover:underline">
            Create account
          </a>
        </p>
      </div>
    </div>
  );
}
