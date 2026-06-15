'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    console.error('[Dashboard Error]', error);
  }, [error]);

  return (
    <div className="rounded-[2rem] bg-white p-10 text-center shadow-soft dark:bg-[#131b2e]">
      <p className="text-sm uppercase tracking-[0.3em] text-secondary-container">Dashboard error</p>
      <h1 className="mt-4 text-3xl font-semibold text-text-heading">Unable to load dashboard</h1>
      <p className="mt-4 text-sm leading-7 text-on-surface-variant">
        Refresh the page or return to the homepage to continue.
      </p>
      {process.env.NODE_ENV === 'development' && (
        <pre className="mt-6 overflow-auto rounded-2xl bg-red-50 p-4 text-left text-xs text-red-700 dark:bg-red-950/30 dark:text-red-400">
          {error.message}
          {'\n\n'}
          {error.stack}
        </pre>
      )}
      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="rounded-2xl bg-secondary px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0047b2]"
        >
          Retry
        </button>
        <button
          type="button"
          onClick={() => router.push('/projects')}
          className="rounded-2xl border border-border-subtle px-6 py-3 text-sm font-semibold text-on-surface transition hover:bg-surface-container dark:border-[#1e3a5f] dark:hover:bg-[#152538]"
        >
          Go to Projects
        </button>
      </div>
    </div>
  );
}
