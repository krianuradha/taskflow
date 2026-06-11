'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

const resetSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm your password')
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match'
  });

type ResetValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ResetValues>({ resolver: zodResolver(resetSchema) });

  const token = params?.token as string | undefined;

  const onSubmit = async (values: ResetValues) => {
    if (!token) {
      setStatus('error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/api/v1/auth/reset-password/${token}`, {
        newPassword: values.password
      });
      setStatus('success');
      setTimeout(() => router.push('/login'), 2200);
    } catch {
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-md rounded-3xl bg-white px-8 py-10 shadow-soft transition-colors dark:bg-[#131b2e]">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.3em] text-secondary-container">Set new password</p>
          <h1 className="mt-3 text-3xl font-semibold text-text-heading">Choose a secure password</h1>
          <p className="mt-2 text-sm text-on-surface-variant">Your password should be unique and at least 8 characters long.</p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <label className="block text-sm font-medium text-on-surface">New password</label>
          <input
            type="password"
            className={cn('w-full rounded-xl border border-border-subtle bg-surface px-4 py-3 text-base text-on-surface transition-colors', errors.password && 'border-error')}
            {...register('password')}
          />
          {errors.password && <p className="text-sm text-error">{errors.password.message}</p>}

          <label className="block text-sm font-medium text-on-surface">Confirm password</label>
          <input
            type="password"
            className={cn('w-full rounded-xl border border-border-subtle bg-surface px-4 py-3 text-base text-on-surface transition-colors', errors.confirmPassword && 'border-error')}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && <p className="text-sm text-error">{errors.confirmPassword.message}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full justify-center rounded-2xl bg-secondary px-4 py-3 text-base font-semibold text-white transition hover:bg-[#0047b2] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Updating password…' : 'Update password'}
          </button>
        </form>
        {status === 'success' && (
          <div className="mt-6 rounded-2xl border border-secondary bg-secondary-container px-4 py-3 text-sm text-secondary">
            Your password is updated. Redirecting to login...
          </div>
        )}
        {status === 'error' && (
          <div className="mt-6 rounded-2xl border border-error bg-error-container px-4 py-3 text-sm text-error">
            Could not reset your password. Check your link and try again.
          </div>
        )}
      </div>
    </div>
  );
}
