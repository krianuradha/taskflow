'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

const forgotSchema = z.object({
  email: z.string().email('Enter a valid email')
});

type ForgotValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema) });

  const onSubmit = async (values: ForgotValues) => {
    setStatus('idle');
    try {
      await api.post('/api/v1/auth/forgot-password', { email: values.email });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-bg-main px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-md rounded-3xl bg-white px-8 py-10 shadow-soft transition-colors dark:bg-[#131b2e]">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.3em] text-secondary-container">Password recovery</p>
          <h1 className="mt-3 text-3xl font-semibold text-text-heading">Reset your password</h1>
          <p className="mt-2 text-sm text-on-surface-variant">Enter your email and we’ll send you instructions to reset your password.</p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <label className="block text-sm font-medium text-on-surface">Email</label>
          <input
            className={cn('w-full rounded-xl border border-border-subtle bg-surface px-4 py-3 text-base text-on-surface transition-colors', errors.email && 'border-error')}
            type="email"
            {...register('email')}
          />
          {errors.email && <p className="text-sm text-error">{errors.email.message}</p>}

          <button
            type="submit"
            className="inline-flex w-full justify-center rounded-2xl bg-secondary px-4 py-3 text-base font-semibold text-white transition hover:bg-[#0047b2]"
          >
            Send reset link
          </button>
        </form>
        {status === 'success' && (
          <div className="mt-6 rounded-2xl border border-secondary bg-secondary-container px-4 py-3 text-sm text-secondary">
            Check your email for password reset instructions.
          </div>
        )}
        {status === 'error' && (
          <div className="mt-6 rounded-2xl border border-error bg-error-container px-4 py-3 text-sm text-error">
            We could not send the reset email. Please try again.
          </div>
        )}
      </div>
    </div>
  );
}
