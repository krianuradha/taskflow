'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardError({ error }: { error: Error }) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-[2rem] bg-white p-10 text-center shadow-soft dark:bg-[#131b2e]">
      <p className="text-sm uppercase tracking-[0.3em] text-secondary-container">Dashboard error</p>
      <h1 className="mt-4 text-3xl font-semibold text-text-heading">Unable to load dashboard</h1>
      <p className="mt-4 text-sm leading-7 text-on-surface-variant">Refresh the page or return to the homepage to continue.</p>
      <button
        type="button"
        onClick={() => router.refresh()}
        className="mt-8 rounded-2xl bg-secondary px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0047b2]"
      >
        Retry
      </button>
    </div>
  );
}
