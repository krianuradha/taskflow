'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

const registerSchema = z
  .object({
    fullname: z.string().min(2, 'Full name is required'),
    username: z.string().min(5, 'Username must be at least 5 characters').regex(/^[a-z0-9_]+$/, 'Username must be lowercase and contain no spaces'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm your password')
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match'
  });

type RegisterValues = z.infer<typeof registerSchema>;

function getStrength(password: string) {
  const score = [/[0-9]/, /[A-Z]/, /[a-z]/, /[^A-Za-z0-9]/].reduce((count, regex) => (regex.test(password) ? count + 1 : count), 0);
  if (password.length >= 12 && score >= 3) return 'Strong';
  if (password.length >= 10 && score >= 2) return 'Good';
  return 'Weak';
}

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const passwordValue = watch('password', '');
  const strength = useMemo(() => getStrength(passwordValue), [passwordValue]);

  const onSubmit = async (values: RegisterValues) => {
    setIsSubmitting(true);
    try {
      await api.post('/api/v1/auth/register', {
        fullname: values.fullname,
        username: values.username,
        email: values.email,
        password: values.password
      });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2300);
    } catch {
      setSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-lg rounded-3xl bg-white px-8 py-10 shadow-soft transition-colors dark:bg-[#131b2e]">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-secondary-container">Create account</p>
          <h1 className="mt-3 text-3xl font-semibold text-text-heading">Start your Project Camp trial</h1>
          <p className="mt-2 text-sm text-on-surface-variant">Register and verify your email to manage projects with your team.</p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <label className="block text-sm font-medium text-on-surface">Full Name</label>
          <input
            className={cn('w-full rounded-xl border border-border-subtle bg-surface px-4 py-3 text-base text-on-surface transition-colors', errors.fullname && 'border-error')}
            {...register('fullname')}
          />
          {errors.fullname && <p className="text-sm text-error">{errors.fullname.message}</p>}

          <label className="block text-sm font-medium text-on-surface">Username</label>
          <input
            className={cn('w-full rounded-xl border border-border-subtle bg-surface px-4 py-3 text-base text-on-surface transition-colors', errors.username && 'border-error')}
            {...register('username')}
          />
          {errors.username && <p className="text-sm text-error">{errors.username.message}</p>}

          <label className="block text-sm font-medium text-on-surface">Email</label>
          <input
            className={cn('w-full rounded-xl border border-border-subtle bg-surface px-4 py-3 text-base text-on-surface transition-colors', errors.email && 'border-error')}
            type="email"
            {...register('email')}
          />
          {errors.email && <p className="text-sm text-error">{errors.email.message}</p>}

          <label className="block text-sm font-medium text-on-surface">Password</label>
          <input
            className={cn('w-full rounded-xl border border-border-subtle bg-surface px-4 py-3 text-base text-on-surface transition-colors', errors.password && 'border-error')}
            type="password"
            {...register('password')}
          />
          {errors.password && <p className="text-sm text-error">{errors.password.message}</p>}
          <p className="text-sm text-on-surface-variant">Strength: <span className="font-semibold">{strength}</span></p>

          <label className="block text-sm font-medium text-on-surface">Confirm password</label>
          <input
            className={cn('w-full rounded-xl border border-border-subtle bg-surface px-4 py-3 text-base text-on-surface transition-colors', errors.confirmPassword && 'border-error')}
            type="password"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && <p className="text-sm text-error">{errors.confirmPassword.message}</p>}

          {success && <p className="rounded-2xl border border-secondary bg-secondary-container px-4 py-3 text-sm text-secondary">Check your email for verification details.</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full justify-center rounded-2xl bg-secondary px-4 py-3 text-base font-semibold text-white transition hover:bg-[#0047b2] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-on-surface-variant">
          Already have an account?{' '}
          <a href="/login" className="font-semibold text-secondary hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
