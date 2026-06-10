'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ErrorPage({ error }: { error: Error }) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg-main px-4 py-20 text-center text-on-surface dark:bg-[#0b1c30]">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-border-subtle bg-white p-10 shadow-soft dark:border-[#1e3a5f] dark:bg-[#131b2e]">
        <p className="text-sm uppercase tracking-[0.3em] text-secondary-container">Something went wrong</p>
        <h1 className="mt-4 text-3xl font-semibold text-text-heading">Unable to load this page</h1>
        <p className="mt-4 text-sm leading-7 text-on-surface-variant">The application encountered an unexpected error. Please refresh or try again later.</p>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="mt-8 rounded-2xl bg-secondary px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0047b2]"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
